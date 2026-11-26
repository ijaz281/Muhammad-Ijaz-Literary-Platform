import django.db.models.deletion
import django.core.files.storage
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="provider",
            field=models.CharField(
                choices=[("jazzcash", "JazzCash"), ("easypaisa", "Easypaisa"), ("raast", "Raast QR")],
                default="jazzcash",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="payment",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("processing", "Processing"),
                    ("under_review", "Under Review"),
                    ("completed", "Approved"),
                    ("rejected", "Rejected"),
                    ("failed", "Failed"),
                    ("cancelled", "Cancelled"),
                    ("refunded", "Refunded"),
                    ("partially_refunded", "Partially Refunded"),
                ],
                default="pending",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="payment",
            name="payment_proof",
            field=models.ImageField(
                blank=True,
                null=True,
                storage=django.core.files.storage.FileSystemStorage(location=settings.BASE_DIR / "private_payment_proofs"),
                upload_to="%Y/%m/",
            ),
        ),
        migrations.AddField(
            model_name="payment",
            name="submitted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payment",
            name="admin_reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payment",
            name="admin_reviewed_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="reviewed_literary_payments",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
