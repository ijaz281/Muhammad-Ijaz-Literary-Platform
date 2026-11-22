
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import Order

logger = logging.getLogger(__name__)


def send_order_notifications(order_id):
    """
    Send order confirmation to the customer
    and new-order notification to the administrator.

    Email failures must never affect order processing.
    """

    try:
        order = (
            Order.objects
            .select_related("user")
            .prefetch_related("items")
            .get(pk=order_id)
        )
    except Order.DoesNotExist:
        logger.error("Email notification: order %s not found.", order_id)
        return

    context = {
        "order": order,
        "items": order.items.all(),
        "platform_name": "Muhammad Ijaz Ul Haq Literary Platform",
    }

    subject = f"Order Confirmation - {order.order_number}"

    if order.customer_email:
        _send_email(
            subject=subject,
            recipient=order.customer_email,
            context=context,
            template_name="orders/emails/order_confirmation",
        )
    else:
        logger.warning(
            "Order %s has no customer email address.",
            order.order_number,
        )

    admin_email = getattr(
        settings,
        "ORDER_NOTIFICATION_EMAIL",
        "",
    )

    if admin_email:
        _send_email(
            subject=f"New Order Received - {order.order_number}",
            recipient=admin_email,
            context=context,
            template_name="orders/emails/admin_new_order",
        )
    else:
        logger.warning(
            "ORDER_NOTIFICATION_EMAIL is not configured."
        )


def _send_email(subject, recipient, context, template_name):
    """
    Send multipart HTML and plain-text email.
    """

    try:
        text_content = render_to_string(
            f"{template_name}.txt",
            context,
        )

        html_content = render_to_string(
            f"{template_name}.html",
            context,
        )

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )

        email.attach_alternative(
            html_content,
            "text/html",
        )

        email.send(fail_silently=False)

        logger.info(
            "Email successfully sent to %s for %s.",
            recipient,
            subject,
        )

        return True

    except Exception:
        logger.exception(
            "Failed to send email to %s. Subject: %s",
            recipient,
            subject,
        )

        return False
