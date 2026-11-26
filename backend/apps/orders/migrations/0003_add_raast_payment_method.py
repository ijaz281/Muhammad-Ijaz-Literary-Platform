from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0002_order_billing_address_order_billing_city_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("cod", "Cash on Delivery"),
                    ("jazzcash", "JazzCash"),
                    ("easypaisa", "Easypaisa"),
                    ("raast", "Raast QR"),
                    ("bank_transfer", "Bank Transfer"),
                    ("legacy", "Legacy / Not Specified"),
                ],
                default="legacy",
                max_length=20,
            ),
        ),
    ]
