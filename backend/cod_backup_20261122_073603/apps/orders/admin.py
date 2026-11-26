from django.contrib import admin
from django.utils import timezone

from .models import (
    ShippingAddress,
    ShoppingCart,
    CartItem,
    Order,
    OrderItem,
)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    autocomplete_fields = ("book",)


@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "updated_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__username", "user__email")
    inlines = [CartItemInline]


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "user",
        "phone",
        "city",
        "country",
        "is_default",
    )
    list_filter = ("country", "city", "is_default")
    search_fields = (
        "full_name",
        "phone",
        "user__username",
        "city",
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "book_title",
        "book_isbn",
        "unit_price",
        "quantity",
        "line_total",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "payment_method",
        "status",
        "payment_status",
        "total_amount",
        "placed_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "payment_method",
        "placed_at",
    )

    search_fields = (
        "order_number",
        "user__username",
        "user__email",
        "customer_email",
        "shipping_name",
        "shipping_phone",
    )

    readonly_fields = (
        "order_number",
        "placed_at",
        "shipped_at",
        "delivered_at",
        "created_at",
        "updated_at",
    )

    inlines = [OrderItemInline]

    fieldsets = (
        ("Order Information", {
            "fields": (
                "order_number",
                "user",
                "status",
                "payment_method",
                "payment_status",
                "customer_email",
            )
        }),
        ("Financial Information", {
            "fields": (
                "subtotal",
                "discount_amount",
                "shipping_fee",
                "tax_amount",
                "total_amount",
            )
        }),
        ("Shipping Information", {
            "fields": (
                "shipping_name",
                "shipping_phone",
                "shipping_address",
                "shipping_city",
                "shipping_state",
                "shipping_postal_code",
                "shipping_country",
            )
        }),
        ("Billing Information", {
            "classes": ("collapse",),
            "fields": (
                "billing_name",
                "billing_phone",
                "billing_address",
                "billing_city",
                "billing_state",
                "billing_postal_code",
                "billing_country",
            ),
        }),
        ("Notes", {
            "fields": ("customer_notes", "admin_notes")
        }),
        ("Delivery Information", {
            "fields": (
                "placed_at",
                "shipped_at",
                "delivered_at",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def save_model(self, request, obj, form, change):
        """
        Maintain delivery timestamps when staff update order status.

        This does NOT mark an order as paid.
        COD collection is handled separately in PaymentAdmin.
        """
        now = timezone.now()

        if obj.status in (
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        ):
            if not obj.shipped_at:
                obj.shipped_at = now

        if obj.status == Order.Status.DELIVERED:
            if not obj.delivered_at:
                obj.delivered_at = now

        super().save_model(request, obj, form, change)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "book_title",
        "order",
        "unit_price",
        "quantity",
        "line_total",
    )

    search_fields = (
        "book_title",
        "book_isbn",
        "order__order_number",
    )

    readonly_fields = ("line_total",)