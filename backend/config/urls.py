from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def home(request):
    return JsonResponse({
        "project": "Muhammad Ijaz Ul Haq - Literary Platform",
        "message": "Backend API is running successfully.",
        "status": "success",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "authentication": "/api/auth/",
            "books": "/api/books/",
            "categories": "/api/categories/",
            "literature": "/api/literature/publications/",
            "authors": "/api/authors/",
            "cart": "/api/store/cart/",
            "checkout": "/api/store/checkout/",
            "orders": "/api/store/orders/",
            "payments": "/api/payments/",
            "contact": "/api/contact/",
            "newsletter": "/api/newsletter/subscribe/",
            "admin_dashboard": "/api/analytics/dashboard/",
        },
    })


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),

    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("apps.users.urls")),

    path("api/", include("apps.bookstore.urls")),
    path("api/literature/", include("apps.literature.urls")),
    path("api/", include("apps.profiles.urls")),
    path("api/", include("apps.interactions.urls")),
    path("api/", include("apps.comments.urls")),
    path("api/store/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/newsletter/", include("apps.newsletter.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
