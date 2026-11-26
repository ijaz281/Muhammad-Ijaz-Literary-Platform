from rest_framework import serializers
from .models import ShippingAddress, ShoppingCart, CartItem, Order, OrderItem


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ["id", "full_name", "phone", "address_line_1", "address_line_2",
                  "city", "state", "postal_code", "country", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_slug = serializers.CharField(source="book.slug", read_only=True)
    cover_image = serializers.ImageField(source="book.cover_image", read_only=True)
    unit_price = serializers.DecimalField(source="book.current_price", max_digits=12,
                                          decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "book", "book_title", "book_slug", "cover_image",
                  "quantity", "unit_price", "line_total", "added_at"]
        read_only_fields = ["id", "book_title", "book_slug", "cover_image",
                            "unit_price", "line_total", "added_at"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = ShoppingCart
        fields = ["id", "status", "items", "subtotal", "total_items", "created_at", "updated_at"]


class AddCartItemSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "book", "book_title", "book_isbn", "unit_price", "quantity", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "order_number", "status", "payment_status", "subtotal",
                  "discount_amount", "shipping_fee", "tax_amount", "total_amount",
                  "shipping_name", "shipping_phone", "shipping_address",
                  "shipping_city", "shipping_state", "shipping_postal_code",
                  "shipping_country", "customer_notes", "payment_method", "items", "placed_at",
                  "shipped_at", "delivered_at", "created_at", "updated_at"]
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField(required=False)
    full_name = serializers.CharField(max_length=200, required=False)
    phone = serializers.CharField(max_length=30, required=False)
    address_line_1 = serializers.CharField(max_length=255, required=False)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=30, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, default="Pakistan")
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=["cod", "jazzcash", "easypaisa", "raast"],
        default="cod",
    )

    def validate(self, attrs):
        if not attrs.get("shipping_address_id"):
            required = ["full_name", "phone", "address_line_1", "city"]
            missing = [field for field in required if not attrs.get(field)]
            if missing:
                raise serializers.ValidationError({
                    field: "This field is required when no saved address is selected."
                    for field in missing
                })
        return attrs
