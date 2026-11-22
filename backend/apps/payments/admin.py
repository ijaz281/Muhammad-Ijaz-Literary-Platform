from django.contrib import admin
from django.utils import timezone
from .models import Payment, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ("refund_reference", "created_at", "updated_at")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payment_reference", "order", "user", "provider", "amount",
                    "currency", "status", "created_at")
    list_filter = ("provider", "status", "currency", "created_at")
    search_fields = ("payment_reference", "transaction_id", "gateway_reference",
                     "order__order_number", "user__username")
    readonly_fields = ("payment_reference", "created_at", "updated_at")
    inlines = [RefundInline]
    fieldsets = (
        ("Payment Information", {"fields": ("payment_reference", "order", "user", "provider", "status")}),
        ("Financial Details", {"fields": ("amount", "currency", "paid_at")}),
        ("Gateway Information", {"fields": ("transaction_id", "gateway_reference",
                                              "gateway_response", "failure_reason")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def save_model(self, request, obj, form, change):
        if obj.status == Payment.Status.COMPLETED and not obj.paid_at:
            obj.paid_at = timezone.now()
        super().save_model(request, obj, form, change)
        order = obj.order
        if obj.status == Payment.Status.COMPLETED:
            order.payment_status = order.PaymentStatus.PAID
            if order.status == order.Status.PENDING:
                order.status = order.Status.CONFIRMED
        elif obj.status == Payment.Status.FAILED:
            order.payment_status = order.PaymentStatus.FAILED
        elif obj.status == Payment.Status.REFUNDED:
            order.payment_status = order.PaymentStatus.REFUNDED
            order.status = order.Status.REFUNDED
        elif obj.status == Payment.Status.PARTIALLY_REFUNDED:
            order.payment_status = order.PaymentStatus.PARTIALLY_REFUNDED
        order.save(update_fields=["payment_status", "status", "updated_at"])


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("refund_reference", "payment", "amount", "status",
                    "processed_at", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("refund_reference", "payment__transaction_id",
                     "payment__payment_reference")
    readonly_fields = ("refund_reference", "created_at", "updated_at")
