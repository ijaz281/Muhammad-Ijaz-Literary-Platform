import secrets
from decimal import Decimal
from urllib.parse import urlencode

from django.conf import settings
from django.core import signing
from django.db import transaction
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer
from .jazzcash import build_mwallet_fields, jazzcash_credentials, verify_secure_hash


class PaymentCreateView(APIView):
    """Create a pending MWALLET payment and return a one-time redirect URL."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_number = request.data.get("order_number")
        order = get_object_or_404(
            Order.objects.select_related("user"),
            order_number=order_number,
            user=request.user,
        )
        if order.payment_method != Order.PaymentMethod.JAZZCASH:
            raise ValidationError({"order": "This order was not placed using JazzCash."})
        if order.status in (Order.Status.CANCELLED, Order.Status.REFUNDED):
            raise ValidationError({"order": "This order cannot be paid."})
        if order.payment_status == Order.PaymentStatus.PAID:
            raise ValidationError({"order": "This order is already paid."})
        if order.total_amount <= Decimal("0.00"):
            raise ValidationError({"order": "Order total must be greater than zero."})
        if not getattr(settings, "JAZZCASH_ENABLED", False):
            raise ValidationError({"payment": "JazzCash sandbox payments are currently disabled."})
        try:
            jazzcash_credentials()
        except RuntimeError as exc:
            raise ValidationError({"payment": str(exc)})

        active_payment = Payment.objects.filter(
            order=order,
            status__in=[Payment.Status.PENDING, Payment.Status.PROCESSING],
        ).order_by("-created_at").first()
        if active_payment and active_payment.gateway_reference:
            raise ValidationError({
                "payment": "A JazzCash transaction is already pending for this order. "
                           "Check its status before starting another attempt."
            })

        now = timezone.localtime()
        txn_ref = "T" + now.strftime("%Y%m%d%H%M%S") + f"{secrets.randbelow(100000):05d}"
        payment = active_payment or Payment.objects.create(
            order=order,
            user=request.user,
            amount=order.total_amount,
            currency="PKR",
            status=Payment.Status.PENDING,
        )
        payment.gateway_reference = txn_ref
        payment.status = Payment.Status.PENDING
        payment.save(update_fields=["gateway_reference", "status", "updated_at"])

        token = signing.dumps(
            {"payment_id": payment.pk},
            salt="jazzcash-mwallet-redirect",
        )
        redirect_url = request.build_absolute_uri(
            f"/api/payments/jazzcash/redirect/{token}/"
        )
        return Response({
            "payment": PaymentSerializer(payment).data,
            "redirect_url": redirect_url,
            "message": "Continue to the official JazzCash payment page.",
        }, status=status.HTTP_201_CREATED)


class JazzCashGatewayRedirectView(APIView):
    """Server-rendered POST form; merchant password never enters React/API JSON."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            payload = signing.loads(
                token,
                salt="jazzcash-mwallet-redirect",
                max_age=600,
            )
        except signing.BadSignature:
            return HttpResponseBadRequest("Invalid or expired payment session.")

        payment = get_object_or_404(
            Payment.objects.select_related("order"),
            pk=payload.get("payment_id"),
        )
        if payment.status != Payment.Status.PENDING or not payment.gateway_reference:
            return HttpResponseBadRequest("This payment session is no longer active.")
        if payment.order.payment_status == Order.PaymentStatus.PAID:
            return HttpResponseBadRequest("This order is already paid.")

        try:
            gateway_url, fields = build_mwallet_fields(payment)
        except RuntimeError:
            return HttpResponseBadRequest("JazzCash merchant configuration is incomplete.")

        hidden_fields = "".join(
            f'<input type="hidden" name="{escape(key)}" value="{escape(value)}">'
            for key, value in fields.items()
        )
        payment.status = Payment.Status.PROCESSING
        payment.save(update_fields=["status", "updated_at"])
        html = (
            "<!doctype html><html><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            "<title>Redirecting to JazzCash</title></head><body>"
            "<p>Redirecting securely to JazzCash. Please wait...</p>"
            f'<form id="jazzcash-form" method="post" action="{escape(gateway_url)}">'
            f"{hidden_fields}</form>"
            "<script>document.getElementById('jazzcash-form').submit();</script>"
            "</body></html>"
        )
        response = HttpResponse(html)
        response["Cache-Control"] = "no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


@method_decorator(csrf_exempt, name="dispatch")
class JazzCashReturnView(APIView):
    """Validate the signed JazzCash POST response before changing order status."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        fields = request.POST.dict()
        try:
            credentials = jazzcash_credentials()
        except RuntimeError:
            return HttpResponseBadRequest("Payment gateway configuration is incomplete.")

        if not verify_secure_hash(fields, credentials["integrity_salt"]):
            return HttpResponseBadRequest("Invalid JazzCash response signature.")

        if fields.get("pp_MerchantID") != credentials["merchant_id"]:
            return HttpResponseBadRequest("Merchant ID mismatch.")

        txn_ref = fields.get("pp_TxnRefNo", "")
        payment = get_object_or_404(
            Payment.objects.select_related("order").filter(
                gateway_reference=txn_ref,
                provider="jazzcash",
            )
        )

        expected_amount = str(int(payment.amount * 100))
        if fields.get("pp_Amount") != expected_amount:
            return HttpResponseBadRequest("Payment amount mismatch.")
        if fields.get("pp_TxnCurrency") != payment.currency:
            return HttpResponseBadRequest("Payment currency mismatch.")
        if fields.get("pp_TxnType") != "MWALLET":
            return HttpResponseBadRequest("Unexpected transaction type.")

        response_code = fields.get("pp_ResponseCode", "")
        uncertain_codes = {"055", "058", "059", "062", "119"}
        safe_response = {
            key: value for key, value in fields.items()
            if key.startswith("pp_") and key not in {"pp_Password", "pp_SecureHash"}
        }

        with transaction.atomic():
            locked_payment = Payment.objects.select_for_update().select_related("order").get(pk=payment.pk)
            locked_order = Order.objects.select_for_update().get(pk=locked_payment.order_id)

            # Repeated gateway callbacks are acknowledged without duplicating updates.
            if locked_payment.status == Payment.Status.COMPLETED:
                return self._frontend_redirect(locked_order, "success")

            locked_payment.gateway_response = safe_response
            if response_code == "000":
                if not fields.get("pp_AuthCode"):
                    return HttpResponseBadRequest("JazzCash success response is missing its authorization code.")
                locked_payment.status = Payment.Status.COMPLETED
                locked_payment.transaction_id = (
                    fields.get("pp_RetrievalReferenceNo")
                    or fields.get("pp_RetreivalReferenceNo")
                    or txn_ref
                )
                locked_payment.gateway_reference = txn_ref
                locked_payment.paid_at = timezone.now()
                locked_payment.failure_reason = ""
                locked_order.payment_status = Order.PaymentStatus.PAID
                locked_payment.save()
                locked_order.save(update_fields=["payment_status", "updated_at"])
                result = "success"
            elif response_code in uncertain_codes or not response_code:
                locked_payment.status = Payment.Status.PROCESSING
                locked_payment.failure_reason = fields.get("pp_ResponseMessage", "Payment status is pending confirmation.")
                locked_payment.save(update_fields=["status", "gateway_response", "failure_reason", "updated_at"])
                result = "pending"
            else:
                locked_payment.status = Payment.Status.FAILED
                locked_payment.failure_reason = fields.get("pp_ResponseMessage", f"JazzCash response code: {response_code}")
                locked_order.payment_status = Order.PaymentStatus.FAILED
                locked_payment.save(update_fields=["status", "gateway_response", "failure_reason", "updated_at"])
                locked_order.save(update_fields=["payment_status", "updated_at"])
                result = "failed"

        return self._frontend_redirect(locked_order, result)

    def get(self, request):
        return HttpResponseBadRequest("JazzCash return endpoint accepts POST requests only.")

    @staticmethod
    def _frontend_redirect(order, result):
        base_url = getattr(settings, "FRONTEND_PAYMENT_RESULT_URL", "").rstrip("/")
        if not base_url:
            base_url = "https://frontend-sigma-navy-97.vercel.app/cart"
        query = urlencode({"payment": result, "order": str(order.order_number)})
        from django.shortcuts import redirect
        return redirect(f"{base_url}?{query}")


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
