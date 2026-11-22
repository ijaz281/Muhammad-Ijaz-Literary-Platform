from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class AnalyticsPermissionTests(APITestCase):
    def test_dashboard_is_not_available_to_regular_readers(self):
        user = get_user_model().objects.create_user(
            username="reader", password="StrongPassword-2026!"
        )
        self.client.force_authenticate(user)
        response = self.client.get("/api/analytics/dashboard/")
        self.assertEqual(response.status_code, 403)
