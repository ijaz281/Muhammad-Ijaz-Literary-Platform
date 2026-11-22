from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookstore.models import Book
from apps.comments.models import Comment
from apps.contact.models import ContactMessage
from apps.literature.models import Literature
from apps.newsletter.models import NewsletterSubscriber
from apps.orders.models import Order
from apps.payments.models import Payment

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        revenue = Payment.objects.filter(status=Payment.Status.COMPLETED).aggregate(
            total=Sum("amount")
        )["total"] or 0
        return Response({
            "counts": {
                "users": User.objects.count(),
                "books": Book.objects.count(),
                "active_books": Book.objects.filter(is_active=True).count(),
                "publications": Literature.objects.count(),
                "published_publications": Literature.objects.filter(is_published=True).count(),
                "pending_comments": Comment.objects.filter(is_approved=False).count(),
                "unread_messages": ContactMessage.objects.filter(is_read=False).count(),
                "active_subscribers": NewsletterSubscriber.objects.filter(is_active=True).count(),
                "orders": Order.objects.count(),
                "pending_orders": Order.objects.filter(status=Order.Status.PENDING).count(),
                "payments": Payment.objects.count(),
            },
            "completed_payment_total_pkr": str(revenue),
            "recent_orders": [
                {
                    "order_number": str(order.order_number),
                    "customer": order.user.username,
                    "status": order.status,
                    "total_amount": str(order.total_amount),
                    "created_at": order.created_at,
                }
                for order in Order.objects.select_related("user").order_by("-created_at")[:10]
            ],
            "orders_by_status": list(
                Order.objects.values("status").annotate(total=Count("id")).order_by("status")
            ),
        })
