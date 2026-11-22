from rest_framework.test import APITestCase
from .models import AuthorProfile


class AuthorProfileAPITests(APITestCase):
    def test_only_active_authors_are_public(self):
        AuthorProfile.objects.create(full_name="Active Author", biography="Biography", is_active=True)
        AuthorProfile.objects.create(full_name="Hidden Author", biography="Biography", is_active=False)

        response = self.client.get("/api/authors/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["full_name"], "Active Author")
