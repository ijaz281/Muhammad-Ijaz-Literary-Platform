from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


class AuthenticationAPITests(APITestCase):
    def test_registration_creates_user(self):
        response = self.client.post("/api/auth/register/", {
            "username": "reader_one",
            "email": "reader@example.com",
            "password": "A-Strong-Password-2026!",
            "password_confirm": "A-Strong-Password-2026!",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(get_user_model().objects.filter(username="reader_one").exists())

    def test_current_user_requires_authentication(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
