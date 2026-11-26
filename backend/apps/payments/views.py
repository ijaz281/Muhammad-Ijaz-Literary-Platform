from decimal import Decimal
from pathlib import Path
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Sum
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer


class PaymentConfigurationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Only public payment destination details are returned; no secrets are stored here.
        return Response({
            method: {
                "account_title": details.get("account_title", ""),
                "account_number": details.get("account_number", ""),
                "instructions": details.get("instructions", ""),
                "qr_image_url": details.get("qr_image_url", ""),
            }
            for method, details in settings.MANUAL_PAYMENT_DETAILS.items()
        })


class PaymentProofUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request, order_number):
        order = get_object_or_404(
            Order.objects.select_for_update(),
            order_number=order_number,
            user=request.user,
        )
        if order.payment_method == Order.PaymentMethod.COD:
            raise ValidationError({"payment": "COD orders do not require payment proof."})
        if order.payment_status == Order.PaymentStatus.PAID:
            raise ValidationError({"payment": "This order is already paid."})
        proof = request.FILES.get("payment_proof")
        if not proof:
            raise ValidationError({"payment_proof": "Upload a transaction screenshot."})
        allowed = {"image/jpeg", "image/png", "image/webp"}
        if proof.content_type not in allowed:
            raise ValidationError({"payment_proof": "Only JPG, PNG and WEBP images are accepted."})
        if proof.size > getattr(settings, "PAYMENT_PROOF_MAX_BYTES", 5 * 1024 * 1024):
            raise ValidationError({"payment_proof": "File size must not exceed 5 MB."})
        try:
            from PIL import Image
            image = Image.open(proof)
            image.verify()
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise ValueError("Unsupported image format")
            proof.seek(0)
        except Exception:
            raise ValidationError({"payment_proof": "The uploaded file is not a valid JPG, PNG or WEBP image."})

        payment = get_object_or_404(
            Payment.objects.select_for_update(),
            order=order,
            user=request.user,
        )
        if payment.status not in [Payment.Status.PENDING, Payment.Status.REJECTED, Payment.Status.UNDER_REVIEW]:
            raise ValidationError({"payment": "This payment cannot accept another proof."})
        if payment.payment_proof:
            payment.payment_proof.delete(save=False)
        transaction_id = str(request.data.get("transaction_id", "")).strip()
        if transaction_id:
            if len(transaction_id) > 255:
                raise ValidationError({"transaction_id": "Transaction reference is too long."})
            if Payment.objects.filter(transaction_id=transaction_id).exclude(pk=payment.pk).exists():
                raise ValidationError({"transaction_id": "This transaction reference has already been submitted."})
            payment.transaction_id = transaction_id
        payment.payment_proof = proof
        payment.submitted_at = timezone.now()
        payment.status = Payment.Status.UNDER_REVIEW
        payment.failure_reason = ""
        payment.save(update_fields=["payment_proof", "transaction_id", "submitted_at", "status", "failure_reason", "updated_at"])
        return Response({
            "payment": PaymentSerializer(payment).data,
            "message": "Proof received. Payment remains under review until an administrator verifies it.",
        }, status=status.HTTP_200_OK)


class PaymentProofView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, pk=payment_id)
        if not payment.payment_proof:
            raise ValidationError({"payment_proof": "No proof has been uploaded."})
        return FileResponse(payment.payment_proof.open("rb"), content_type="application/octet-stream")


class PaymentCreateView(APIView):
    """Creates a pending payment record; it does not charge a card or call JazzCash."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_number = request.data.get("order_number")
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        if order.status in (Order.Status.CANCELLED, Order.Status.REFUNDED):
            raise ValidationError({"order": "This order cannot be paid."})
        if order.payment_status == Order.PaymentStatus.PAID:
            raise ValidationError({"order": "This order is already paid."})
        if order.total_amount <= Decimal("0.00"):
            raise ValidationError({"order": "Order total must be greater than zero."})
        payment = Payment.objects.filter(
            order=order,
            status__in=[
                Payment.Status.PENDING,
                Payment.Status.PROCESSING,
                Payment.Status.UNDER_REVIEW,
                Payment.Status.REJECTED,
            ],
        ).order_by("-created_at").first()
        if payment is None:
            payment = Payment.objects.create(
                order=order,
                user=request.user,
                provider=order.payment_method if order.payment_method in ("jazzcash", "easypaisa", "raast") else "jazzcash",
                amount=order.total_amount,
                currency="PKR",
            )
        return Response({
            "payment": PaymentSerializer(payment).data,
            "message": (
                "Pending payment record created. Configure and verify the official "
                "JazzCash merchant integration before accepting real payments."
            ),
            "gateway_configured": False,
        }, status=201)


class MyPaymentsView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related("order")


class RefundRequestView(generics.CreateAPIView):
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        payment = get_object_or_404(
            Payment, pk=request.data.get("payment"), user=request.user
        )
        if payment.status not in (Payment.Status.COMPLETED, Payment.Status.PARTIALLY_REFUNDED):
            raise ValidationError({"payment": "Only completed payments can be refunded."})
        amount = request.data.get("amount")
        try:
            amount = Decimal(str(amount))
        except Exception:
            raise ValidationError({"amount": "Enter a valid refund amount."})
        if amount <= 0:
            raise ValidationError({"amount": "Refund amount must be positive."})
        already_refunded = payment.refunds.filter(status=Refund.Status.COMPLETED).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")
        pending = payment.refunds.filter(
            status__in=[Refund.Status.REQUESTED, Refund.Status.PROCESSING]
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        if already_refunded + pending + amount > payment.amount:
            raise ValidationError({"amount": "Total refunds cannot exceed the payment amount."})
        refund = Refund.objects.create(
            payment=payment, amount=amount, reason=request.data.get("reason", "")
        )
        return Response(RefundSerializer(refund).data, status=201)


class MyRefundsView(generics.ListAPIView):
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Refund.objects.filter(payment__user=self.request.user).select_related("payment")
