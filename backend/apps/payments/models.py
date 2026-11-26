import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.files.storage import FileSystemStorage
from django.db import models


class Payment(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        UNDER_REVIEW = "under_review", "Under Review"
        COMPLETED = "completed", "Approved"
        REJECTED = "rejected", "Rejected"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"
        PARTIALLY_REFUNDED = (
            "partially_refunded",
            "Partially Refunded",
        )

    payment_reference = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.PROTECT,
        related_name="payments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="literary_payments",
    )

    provider = models.CharField(
        max_length=20,
        choices=[
            ("jazzcash", "JazzCash"),
            ("easypaisa", "Easypaisa"),
            ("raast", "Raast QR"),
        ],
        default="jazzcash",
    )

    payment_proof = models.ImageField(
        upload_to="%Y/%m/",
        storage=FileSystemStorage(location=settings.BASE_DIR / "private_payment_proofs"),
        blank=True,
        null=True,
    )
    submitted_at = models.DateTimeField(blank=True, null=True)
    admin_reviewed_at = models.DateTimeField(blank=True, null=True)
    admin_reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="reviewed_literary_payments",
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    currency = models.CharField(
        max_length=3,
        default="PKR",
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    gateway_reference = models.CharField(
        max_length=255,
        blank=True,
    )

    gateway_response = models.JSONField(
        default=dict,
        blank=True,
    )

    failure_reason = models.TextField(blank=True)

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order", "status"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        provider_name = self.provider.replace("_", " ").title()

        return (
            f"{provider_name} Payment "
            f"{self.payment_reference}"
        )


class Refund(models.Model):

    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        REJECTED = "rejected", "Rejected"
        FAILED = "failed", "Failed"


    payment = models.ForeignKey(
        Payment,
        on_delete=models.PROTECT,
        related_name="refunds",
    )

    refund_reference = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED,
    )

    reason = models.TextField(blank=True)

    gateway_refund_id = models.CharField(
        max_length=255,
        blank=True,
    )

    processed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Refund {self.refund_reference} "
            f"for {self.payment.payment_reference}"
        )