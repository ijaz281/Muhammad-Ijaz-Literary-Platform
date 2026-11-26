from decimal import Decimal
from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.db import connection
from django.test import RequestFactory

from rest_framework.test import APITestCase

from apps.orders.models import Order
from apps.payments.admin import PaymentAdmin

from .models import Payment, Refund


class PaymentAPITests(APITestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reader",
            password="StrongPassword-2026!",
        )

        self.order = Order.objects.create(
            user=self.user,
            payment_method=Order.PaymentMethod.JAZZCASH,
            subtotal=Decimal("500.00"),
            total_amount=Decimal("500.00"),
            shipping_name="Test Reader",
            shipping_phone="03000000000",
            shipping_address="Test Street",
            shipping_city="Bahawalpur",
        )

        self.client.force_authenticate(self.user)

    def create_cod_order(self, status=Order.Status.DELIVERED):
        return Order.objects.create(
            user=self.user,
            payment_method=Order.PaymentMethod.COD,
            status=status,
            subtotal=Decimal("500.00"),
            total_amount=Decimal("500.00"),
            shipping_name="Test Reader",
            shipping_phone="03000000000",
            shipping_address="Test Street",
            shipping_city="Bahawalpur",
        )

    def create_cod_payment(self, order):
        return Payment.objects.create(
            order=order,
            user=self.user,
            provider="cod",
            status=Payment.Status.PENDING,
            amount=order.total_amount,
            currency="PKR",
        )

    def run_cod_collection_action(self, payment):
        request = RequestFactory().post(
            "/admin/payments/payment/"
        )

        request.user = self.user

        payment_admin = PaymentAdmin(
            Payment,
            admin.site,
        )

        with patch.object(
            PaymentAdmin,
            "message_user",
        ):
            payment_admin.mark_cod_collected(
                request,
                Payment.objects.filter(pk=payment.pk),
            )

    def test_payment_endpoint_creates_pending_record_without_claiming_gateway_payment(self):
        response = self.client.post(
            "/api/payments/create/",
            {
                "order_number": str(self.order.order_number),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertFalse(
            response.data["gateway_configured"]
        )

        self.assertEqual(
            response.data["payment"]["status"],
            Payment.Status.PENDING,
        )

        self.assertEqual(
            Payment.objects.count(),
            1,
        )

    def test_payment_tables_exist_after_migration(self):
        tables = connection.introspection.table_names()

        self.assertIn(
            Payment._meta.db_table,
            tables,
        )

        self.assertIn(
            Refund._meta.db_table,
            tables,
        )

    def test_refund_request_is_validated_and_recorded_for_staff_review(self):
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=Decimal("500.00"),
            status=Payment.Status.COMPLETED,
        )

        response = self.client.post(
            "/api/payments/refunds/",
            {
                "payment": payment.pk,
                "amount": "125.00",
                "reason": "Damaged item",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            response.data["status"],
            Refund.Status.REQUESTED,
        )

        self.assertEqual(
            Refund.objects.count(),
            1,
        )

    def test_refund_cannot_exceed_payment_amount(self):
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=Decimal("500.00"),
            status=Payment.Status.COMPLETED,
        )

        response = self.client.post(
            "/api/payments/refunds/",
            {
                "payment": payment.pk,
                "amount": "500.01",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            Refund.objects.count(),
            0,
        )

    def test_admin_can_record_cod_collection_after_delivery(self):
        order = self.create_cod_order(
            status=Order.Status.DELIVERED,
        )

        payment = self.create_cod_payment(order)

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PENDING,
        )

        self.run_cod_collection_action(payment)

        payment.refresh_from_db()
        order.refresh_from_db()

        self.assertEqual(
            payment.status,
            Payment.Status.COMPLETED,
        )

        self.assertIsNotNone(
            payment.paid_at,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PAID,
        )

        self.assertEqual(
            order.status,
            Order.Status.DELIVERED,
        )

    def test_admin_cannot_collect_cod_before_delivery(self):
        order = self.create_cod_order(
            status=Order.Status.PROCESSING,
        )

        payment = self.create_cod_payment(order)

        self.run_cod_collection_action(payment)

        payment.refresh_from_db()
        order.refresh_from_db()

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )

        self.assertIsNone(
            payment.paid_at,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PENDING,
        )

    def test_admin_cannot_process_jazzcash_payment_as_cod_collection(self):
        order = Order.objects.create(
            user=self.user,
            payment_method=Order.PaymentMethod.JAZZCASH,
            status=Order.Status.DELIVERED,
            subtotal=Decimal("500.00"),
            total_amount=Decimal("500.00"),
            shipping_name="Test Reader",
            shipping_phone="03000000000",
            shipping_address="Test Street",
            shipping_city="Bahawalpur",
        )

        payment = Payment.objects.create(
            order=order,
            user=self.user,
            provider="jazzcash",
            status=Payment.Status.PENDING,
            amount=order.total_amount,
            currency="PKR",
        )

        self.run_cod_collection_action(payment)

        payment.refresh_from_db()
        order.refresh_from_db()

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )

        self.assertIsNone(
            payment.paid_at,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PENDING,
        )

    def test_admin_cannot_collect_cod_when_payment_amount_does_not_match_order(self):
        order = self.create_cod_order(
            status=Order.Status.DELIVERED,
        )

        payment = Payment.objects.create(
            order=order,
            user=self.user,
            provider="cod",
            status=Payment.Status.PENDING,
            amount=Decimal("400.00"),
            currency="PKR",
        )

        self.run_cod_collection_action(payment)

        payment.refresh_from_db()
        order.refresh_from_db()

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )

        self.assertIsNone(
            payment.paid_at,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.PENDING,
        )