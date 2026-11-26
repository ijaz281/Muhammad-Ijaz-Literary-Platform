from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.bookstore.models import Book, BookCategory
from apps.payments.models import Payment

from .models import Order


class OrderFlowAPITests(APITestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reader",
            password="StrongPassword-2026!",
        )

        self.client.force_authenticate(self.user)

        category = BookCategory.objects.create(
            name="Fiction",
        )

        self.book = Book.objects.create(
            title="Test Book",
            category=category,
            description="A book",
            price=Decimal("250.00"),
            stock_quantity=5,
        )

    def add_book_to_cart(self, quantity=2):
        return self.client.post(
            "/api/store/cart/",
            {
                "book_id": self.book.pk,
                "quantity": quantity,
            },
            format="json",
        )

    def checkout(self, payment_method="jazzcash"):
        return self.client.post(
            "/api/store/checkout/",
            {
                "full_name": "Test Reader",
                "phone": "03000000000",
                "address_line_1": "Test Street",
                "city": "Bahawalpur",
                "payment_method": payment_method,
            },
            format="json",
        )

    def test_cart_checkout_creates_order_and_reserves_stock(self):
        cart_response = self.add_book_to_cart(quantity=2)

        self.assertEqual(cart_response.status_code, 201)

        checkout_response = self.checkout()

        self.assertEqual(checkout_response.status_code, 201)

        order = Order.objects.get()

        self.assertEqual(
            order.total_amount,
            Decimal("500.00"),
        )

        self.assertEqual(
            order.payment_method,
            Order.PaymentMethod.JAZZCASH,
        )

        self.book.refresh_from_db()

        self.assertEqual(self.book.stock_quantity, 3)

    def test_cod_checkout_creates_pending_payment_and_does_not_mark_order_paid(self):
        cart_response = self.add_book_to_cart(quantity=2)

        self.assertEqual(cart_response.status_code, 201)

        checkout_response = self.checkout(
            payment_method="cod",
        )

        self.assertEqual(
            checkout_response.status_code,
            201,
        )

        order = Order.objects.get()

        self.assertEqual(
            order.payment_method,
            Order.PaymentMethod.COD,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PENDING,
        )

        payment = Payment.objects.get(order=order)

        self.assertEqual(
            payment.provider,
            "cod",
        )

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )

        self.assertEqual(
            payment.amount,
            order.total_amount,
        )

        self.assertIsNone(payment.paid_at)

        self.book.refresh_from_db()

        self.assertEqual(
            self.book.stock_quantity,
            3,
        )