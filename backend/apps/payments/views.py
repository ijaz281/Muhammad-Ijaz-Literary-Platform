from decimal import Decimal
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer


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
            order=order, status__in=[Payment.Status.PENDING, Payment.Status.PROCESSING]
        ).order_by("-created_at").first()
        if payment is None:
            payment = Payment.objects.create(
                order=order, user=request.user, amount=order.total_amount, currency="PKR"
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
