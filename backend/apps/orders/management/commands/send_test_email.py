
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.core.mail import send_mail


class Command(BaseCommand):
    help = "Send a test email using configured Gmail SMTP."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            required=True,
            help="Recipient email address.",
        )

    def handle(self, *args, **options):
        recipient = options["to"]

        if not settings.EMAIL_HOST_USER:
            raise CommandError(
                "EMAIL_HOST_USER is not configured."
            )

        if not settings.EMAIL_HOST_PASSWORD:
            raise CommandError(
                "EMAIL_HOST_PASSWORD is not configured."
            )

        if not settings.DEFAULT_FROM_EMAIL:
            raise CommandError(
                "DEFAULT_FROM_EMAIL is not configured."
            )

        self.stdout.write(
            f"Sending test email to {recipient}..."
        )

        try:
            result = send_mail(
                subject="Gmail SMTP Test - Literary Platform",
                message=(
                    "Congratulations!\n\n"
                    "Your Django Gmail SMTP configuration "
                    "is working successfully.\n\n"
                    "Your literary platform can now send emails."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )

            if result == 1:
                self.stdout.write(
                    self.style.SUCCESS(
                        "SUCCESS: Test email sent successfully."
                    )
                )
            else:
                raise CommandError(
                    "Email backend did not report a successful send."
                )

        except Exception as exc:
            raise CommandError(
                f"Email delivery failed: {exc}"
            )
