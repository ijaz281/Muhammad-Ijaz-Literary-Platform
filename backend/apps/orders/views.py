from decimal import Decimal
from django.db import transaction
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookstore.models import Book
from apps.payments.models import Payment
from .models import ShippingAddress, ShoppingCart, CartItem, Order, OrderItem
from .serializers import (
    ShippingAddressSerializer, CartSerializer, AddCartItemSerializer,
    UpdateCartItemSerializer, OrderSerializer, CheckoutSerializer,
)


def active_cart_for(user):
    cart, _ = ShoppingCart.objects.get_or_create(
        user=user, status=ShoppingCart.Status.ACTIVE
    )
    return cart


class ShippingAddressListCreateView(generics.ListCreateAPIView):
    serializer_class = ShippingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        is_default = serializer.validated_data.get("is_default", False)
        if is_default:
            ShippingAddress.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)


class ShippingAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShippingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get("is_default"):
            ShippingAddress.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = active_cart_for(request.user)
        cart = ShoppingCart.objects.prefetch_related("items__book").get(pk=cart.pk)
        return Response(CartSerializer(cart).data)

    @transaction.atomic
    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = active_cart_for(request.user)
        book = get_object_or_404(Book, pk=serializer.validated_data["book_id"], is_active=True)
        quantity = serializer.validated_data["quantity"]
        item, created = CartItem.objects.get_or_create(
            cart=cart, book=book, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity += quantity
        if item.quantity > book.stock_quantity:
            raise ValidationError({"quantity": f"Only {book.stock_quantity} copies are currently available."})
        item.save()
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = active_cart_for(request.user)
        item = get_object_or_404(CartItem.objects.select_related("book"), pk=item_id, cart=cart)
        quantity = serializer.validated_data["quantity"]
        if quantity > item.book.stock_quantity:
            raise ValidationError({"quantity": f"Only {item.book.stock_quantity} copies are currently available."})
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart = active_cart_for(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        cart = ShoppingCart.objects.select_for_update().filter(
            user=request.user, status=ShoppingCart.Status.ACTIVE
        ).first()
        if not cart:
            raise ValidationError({"cart": "Your shopping cart is empty."})
        items = list(cart.items.select_related("book").all())
        if not items:
            raise ValidationError({"cart": "Your shopping cart is empty."})

        if data.get("shipping_address_id"):
            address = get_object_or_404(
                ShippingAddress, pk=data["shipping_address_id"], user=request.user
            )
            shipping = {
                "shipping_name": address.full_name,
                "shipping_phone": address.phone,
                "shipping_address": " ".join(filter(None, [address.address_line_1, address.address_line_2])),
                "shipping_city": address.city,
                "shipping_state": address.state,
                "shipping_postal_code": address.postal_code,
                "shipping_country": address.country,
            }
        else:
            shipping = {
                "shipping_name": data["full_name"],
                "shipping_phone": data["phone"],
                "shipping_address": " ".join(filter(None, [
                    data["address_line_1"], data.get("address_line_2", "")
                ])),
                "shipping_city": data["city"],
                "shipping_state": data.get("state", ""),
                "shipping_postal_code": data.get("postal_code", ""),
                "shipping_country": data.get("country", "Pakistan"),
            }

        subtotal = Decimal("0.00")
        for item in items:
            book = Book.objects.select_for_update().get(pk=item.book_id)
            if not book.is_active or book.stock_quantity < item.quantity:
                raise ValidationError({
                    "inventory": f"Insufficient stock for {book.title}. Available: {book.stock_quantity}."
                })
            subtotal += book.current_price * item.quantity

        shipping_fee = Decimal(str(getattr(settings, "LITERARY_SHIPPING_FEE", "0.00")))
        total = subtotal + shipping_fee
        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            tax_amount=Decimal("0.00"),
            discount_amount=Decimal("0.00"),
            total_amount=total,
            payment_method=data.get("payment_method", Order.PaymentMethod.COD),
            customer_notes=data.get("customer_notes", ""),
            **shipping,
        )
        for item in items:
            book = Book.objects.select_for_update().get(pk=item.book_id)
            price = book.current_price
            OrderItem.objects.create(
                order=order, book=book, book_title=book.title,
                book_isbn=book.isbn or "", unit_price=price,
                quantity=item.quantity, line_total=price * item.quantity,
            )
            book.stock_quantity -= item.quantity
            book.save(update_fields=["stock_quantity", "updated_at"])

        if order.payment_method != Order.PaymentMethod.COD:
            Payment.objects.create(
                order=order,
                user=request.user,
                provider=order.payment_method,
                amount=order.total_amount,
                currency="PKR",
                status=Payment.Status.PENDING,
            )

        cart.status = ShoppingCart.Status.CONVERTED
        cart.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_number):
        order = get_object_or_404(
            Order.objects.select_for_update().prefetch_related("items"),
            order_number=order_number, user=request.user
        )
        if order.status != Order.Status.PENDING or order.payment_status == Order.PaymentStatus.PAID:
            raise ValidationError({"status": "Only unpaid pending orders can be cancelled online."})
        for item in order.items.all():
            if item.book_id:
                book = Book.objects.select_for_update().filter(pk=item.book_id).first()
                if book:
                    book.stock_quantity += item.quantity
                    book.save(update_fields=["stock_quantity", "updated_at"])
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)
