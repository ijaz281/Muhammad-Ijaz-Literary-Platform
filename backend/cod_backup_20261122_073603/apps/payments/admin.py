from django.contrib import admin, messages
from django.db import transaction
from django.utils import timezone

from apps.orders.models import Order

from .models import Payment, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = (
        "refund_reference",
        "created_at",
        "updated_at",
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "payment_reference",
        "order",
        "user",
        "provider",
        "amount",
        "currency",
        "status",
        "paid_at",
        "created_at",
    )

    list_filter = (
        "provider",
        "status",
        "currency",
        "created_at",
    )

    search_fields = (
        "payment_reference",
        "transaction_id",
        "gateway_reference",
        "order__order_number",
        "user__username",
    )

    readonly_fields = (
        "payment_reference",
        "provider",
        "created_at",
        "updated_at",
    )

    inlines = [RefundInline]

    actions = [
        "mark_cod_collected",
    ]

    fieldsets = (
        ("Payment Information", {
            "fields": (
                "payment_reference",
                "order",
                "user",
                "provider",
                "status",
            )
        }),
        ("Financial Details", {
            "fields": (
                "amount",
                "currency",
                "paid_at",
            )
        }),
        ("Gateway Information", {
            "fields": (
                "transaction_id",
                "gateway_reference",
                "gateway_response",
                "failure_reason",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",),
        }),
    )

    def has_add_permission(self, request):
        # Payments should be created through the checkout/payment APIs.
        return False

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))

        # COD status must only be changed through the collection action.
        if obj and obj.provider == "cod":
            fields.append("status")

        return tuple(fields)

    @admin.action(
        description="Record COD cash collection (delivered orders only)"
    )
    def mark_cod_collected(self, request, queryset):
        """
        Record cash collection for eligible COD payments.

        Conditions:
        - Provider must be COD.
        - Order payment method must be COD.
        - Order must be delivered.
        - Payment must be pending or processing.
        - Payment amount must match order total.
        - Order must not already be marked paid.
        """

        payment_ids = list(
            queryset.values_list("pk", flat=True)
        )

        collected = 0
        skipped = 0

        with transaction.atomic():

            for payment_id in payment_ids:

                payment = (
                    Payment.objects
                    .select_for_update()
                    .filter(pk=payment_id)
                    .first()
                )

                if payment is None:
                    skipped += 1
                    continue

                order = (
                    Order.objects
                    .select_for_update()
                    .get(pk=payment.order_id)
                )

                if payment.provider != "cod":
                    skipped += 1
                    continue

                if order.payment_method != Order.PaymentMethod.COD:
                    skipped += 1
                    continue

                if order.status != Order.Status.DELIVERED:
                    skipped += 1
                    continue

                if payment.status not in (
                    Payment.Status.PENDING,
                    Payment.Status.PROCESSING,
                ):
                    skipped += 1
                    continue

                if order.payment_status == Order.PaymentStatus.PAID:
                    skipped += 1
                    continue

                if payment.amount != order.total_amount:
                    skipped += 1
                    continue

                if payment.currency != "PKR":
                    skipped += 1
                    continue

                # Record successful cash collection.
                payment.status = Payment.Status.COMPLETED
                payment.paid_at = timezone.now()

                payment.save(
                    update_fields=[
                        "status",
                        "paid_at",
                        "updated_at",
                    ]
                )

                # Synchronize the associated order.
                order.payment_status = Order.PaymentStatus.PAID

                order.save(
                    update_fields=[
                        "payment_status",
                        "updated_at",
                    ]
                )

                collected += 1

        if collected:
            self.message_user(
                request,
                f"Successfully recorded cash collection for "
                f"{collected} COD payment(s).",
                level=messages.SUCCESS,
            )

        if skipped:
            self.message_user(
                request,
                f"{skipped} payment(s) skipped because they were "
                f"not eligible for COD collection.",
                level=messages.WARNING,
            )

        if not collected and not skipped:
            self.message_user(
                request,
                "No payments were selected.",
                level=messages.INFO,
            )

    def save_model(self, request, obj, form, change):
        """
        Synchronize online payment status with the related order.

        COD payments cannot be manually completed through this form.
        They must use the dedicated cash collection action.
        """

        if obj.provider == "cod" and change:
            original = Payment.objects.get(pk=obj.pk)

            # Protect COD status from accidental form modifications.
            if obj.status != original.status:
                obj.status = original.status
                obj.paid_at = original.paid_at

        if (
            obj.provider != "cod"
            and obj.status == Payment.Status.COMPLETED
            and not obj.paid_at
        ):
            obj.paid_at = timezone.now()

        super().save_model(request, obj, form, change)

        if obj.provider == "cod":
            return

        order = obj.order

        if obj.status == Payment.Status.COMPLETED:
            order.payment_status = Order.PaymentStatus.PAID

            if order.status == Order.Status.PENDING:
                order.status = Order.Status.CONFIRMED

        elif obj.status == Payment.Status.FAILED:
            order.payment_status = Order.PaymentStatus.FAILED

        elif obj.status == Payment.Status.REFUNDED:
            order.payment_status = Order.PaymentStatus.REFUNDED
            order.status = Order.Status.REFUNDED

        elif obj.status == Payment.Status.PARTIALLY_REFUNDED:
            order.payment_status = (
                Order.PaymentStatus.PARTIALLY_REFUNDED
            )

        order.save(
            update_fields=[
                "payment_status",
                "status",
                "updated_at",
            ]
        )


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):

    list_display = (
        "refund_reference",
        "payment",
        "amount",
        "status",
        "processed_at",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "refund_reference",
        "payment__transaction_id",
        "payment__payment_reference",
    )

    readonly_fields = (
        "refund_reference",
        "created_at",
        "updated_at",
    )