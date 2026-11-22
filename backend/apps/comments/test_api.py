from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from apps.literature.models import Literature
from .models import Comment


class CommentAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reader", password="StrongPassword-2026!"
        )
        self.publication = Literature.objects.create(
            title="A Published Work", category="poetry", content="Text", is_published=True
        )

    def test_comment_requires_login_and_is_pending_moderation(self):
        url = f"/api/publications/{self.publication.pk}/comments/"
        self.assertEqual(self.client.post(url, {"content": "A thoughtful comment"}).status_code, 401)

        self.client.force_authenticate(self.user)
        response = self.client.post(url, {"content": "A thoughtful comment"})
        self.assertEqual(response.status_code, 201)
        comment = Comment.objects.get()
        self.assertFalse(comment.is_approved)
        self.assertNotContains(self.client.get(url), "A thoughtful comment")
