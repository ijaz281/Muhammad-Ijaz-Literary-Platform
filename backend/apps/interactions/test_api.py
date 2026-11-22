from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from .models import PublicationLike, Bookmark
from apps.literature.models import Literature


class InteractionAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reader", password="StrongPassword-2026!"
        )
        self.publication = Literature.objects.create(
            title="A Published Work", category="poetry", content="Text", is_published=True
        )
        self.client.force_authenticate(self.user)

    def test_like_and_bookmark_are_created_once(self):
        url = f"/api/publications/{self.publication.slug}/like/"
        first = self.client.post(url)
        second = self.client.post(url)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(PublicationLike.objects.count(), 1)

        bookmark_url = f"/api/publications/{self.publication.slug}/bookmark/"
        response = self.client.post(bookmark_url)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Bookmark.objects.count(), 1)
