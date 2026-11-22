from rest_framework import serializers
from .models import Payment, Refund


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.UUIDField(source="order.order_number", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "payment_reference", "order", "order_number", "provider",
                  "status", "amount", "currency", "transaction_id",
                  "gateway_reference", "failure_reason", "paid_at", "created_at"]
        read_only_fields = fields


class RefundSerializer(serializers.ModelSerializer):
    payment_reference = serializers.UUIDField(source="payment.payment_reference", read_only=True)

    class Meta:
        model = Refund
        fields = ["id", "refund_reference", "payment", "payment_reference",
                  "amount", "status", "reason", "processed_at", "created_at"]
        read_only_fields = ["id", "refund_reference", "payment_reference",
                            "status", "processed_at", "created_at"]
