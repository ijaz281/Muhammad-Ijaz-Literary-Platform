
import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.utils.html import strip_tags

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import ContactMessage
from .serializers import ContactMessageCreateSerializer


logger = logging.getLogger(__name__)


class ContactMessageCreateView(generics.CreateAPIView):

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save message first so it is never lost
        contact_message = serializer.save()

        recipient = getattr(
            settings,
            "CONTACT_NOTIFICATION_EMAIL",
            settings.EMAIL_HOST_USER,
        )

        if not recipient:
            logger.error(
                "Contact notification recipient is not configured. "
                "Contact message ID: %s",
                contact_message.id,
            )

            return Response(
                {
                    "message": (
                        "Your message was saved, but email "
                        "notification could not be configured."
                    ),
                    "saved": True,
                    "email_sent": False,
                },
                status=status.HTTP_201_CREATED,
            )

        subject = (
            f"New Website Contact Message: "
            f"{contact_message.subject}"
        )

        body = f"""
A new contact message has been received.

Name: {contact_message.name}

Email: {contact_message.email}

Subject: {contact_message.subject}

Message:
{contact_message.message}

----------------------------------

Message ID: {contact_message.id}
Received: {contact_message.created_at}

Muhammad Ijaz Literary Platform
"""

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=[contact_message.email],
        )

        try:
            email_sent = email.send(fail_silently=False)

            if email_sent == 1:

                logger.info(
                    "Contact notification sent successfully. "
                    "Message ID: %s",
                    contact_message.id,
                )

                return Response(
                    {
                        "message": (
                            "Your message has been sent successfully."
                        ),
                        "saved": True,
                        "email_sent": True,
                    },
                    status=status.HTTP_201_CREATED,
                )

            logger.error(
                "Contact email backend returned zero. "
                "Message ID: %s",
                contact_message.id,
            )

        except Exception:
            logger.exception(
                "Contact email delivery failed. "
                "Message ID: %s",
                contact_message.id,
            )

        return Response(
            {
                "message": (
                    "Your message was saved, but email notification "
                    "could not be sent. Please try again later."
                ),
                "saved": True,
                "email_sent": False,
            },
            status=status.HTTP_201_CREATED,
        )
