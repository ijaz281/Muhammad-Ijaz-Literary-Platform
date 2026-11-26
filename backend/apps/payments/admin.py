from django.contrib import admin, messages
from django.utils import timezone
from django.urls import reverse
from django.utils.html import format_html
from django.db import transaction
from .models import Payment, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ("refund_reference", "created_at", "updated_at")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_reference", "order", "customer_name", "customer_email",
        "provider", "amount", "currency", "status", "submitted_at",
    )
    list_filter = ("provider", "status", "currency", "created_at", "submitted_at")
    search_fields = (
        "payment_reference", "transaction_id", "gateway_reference",
        "order__order_number", "user__username", "user__email",
    )
    readonly_fields = (
        "payment_reference", "created_at", "updated_at", "submitted_at",
        "admin_reviewed_at", "admin_reviewed_by", "proof_preview",
    )
    actions = ("approve_selected_payments", "reject_selected_payments")
    inlines = [RefundInline]
    fieldsets = (
        ("Payment Information", {"fields": (
            "payment_reference", "order", "user", "provider", "status",
            "proof_preview", "submitted_at",
        )}),
        ("Financial Details", {"fields": ("amount", "currency", "paid_at")}),
        ("Transaction Details", {"fields": (
            "transaction_id", "gateway_reference", "failure_reason",
        )}),
        ("Review Audit", {"fields": (
            "admin_reviewed_at", "admin_reviewed_by",
        )}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Customer")
    def customer_name(self, obj):
        return obj.order.shipping_name

    @admin.display(description="Customer email")
    def customer_email(self, obj):
        return obj.order.customer_email or obj.user.email

    @admin.display(description="Uploaded proof")
    def proof_preview(self, obj):
        if not obj or not obj.payment_proof:
            return "No proof uploaded"
        url = reverse("admin-payment-proof", args=[obj.pk])
        return format_html('<a href="{}" target="_blank" rel="noopener">View private proof</a>', url)

    def _review(self, request, queryset, approve):
        with transaction.atomic():
            for payment in queryset.select_related("order").select_for_update():
                if payment.status not in (Payment.Status.PENDING, Payment.Status.UNDER_REVIEW, Payment.Status.REJECTED):
                    continue
                if approve:
                    if not payment.payment_proof:
                        self.message_user(request, f"Payment {payment.pk} has no proof; skipped.", level=messages.WARNING)
                        continue
                    payment.status = Payment.Status.COMPLETED
                    payment.paid_at = timezone.now()
                    payment.failure_reason = ""
                    payment.order.payment_status = payment.order.PaymentStatus.PAID
                    if payment.order.status == payment.order.Status.PENDING:
                        payment.order.status = payment.order.Status.CONFIRMED
                    payment.order.save(update_fields=["payment_status", "status", "updated_at"])
                else:
                    payment.status = Payment.Status.REJECTED
                    payment.failure_reason = "Rejected by administrator. Customer may upload corrected proof."
                payment.admin_reviewed_at = timezone.now()
                payment.admin_reviewed_by = request.user
                payment.save(update_fields=[
                    "status", "paid_at", "failure_reason", "admin_reviewed_at",
                    "admin_reviewed_by", "updated_at",
                ])
        self.message_user(request, "Selected payment review action completed.")

    @admin.action(description="Approve selected manual payments")
    def approve_selected_payments(self, request, queryset):
        self._review(request, queryset, True)

    @admin.action(description="Reject selected manual payments")
    def reject_selected_payments(self, request, queryset):
        self._review(request, queryset, False)

    def save_model(self, request, obj, form, change):
        # Prevent direct status edits from bypassing the auditable review action.
        if change:
            old = Payment.objects.get(pk=obj.pk)
            if obj.status != old.status and obj.status in (Payment.Status.COMPLETED, Payment.Status.REJECTED):
                obj.status = old.status
                self.message_user(request, "Use the Approve/Reject admin action to review a payment.", level=messages.WARNING)
        super().save_model(request, obj, form, change)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("refund_reference", "payment", "amount", "status", "processed_at", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("refund_reference", "payment__transaction_id", "payment__payment_reference")
    readonly_fields = ("refund_reference", "created_at", "updated_at")
