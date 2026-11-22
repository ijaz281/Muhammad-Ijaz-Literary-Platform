from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from apps.literature.models import Literature
from .models import Comment


class CommentModerationTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="reader", email="reader@example.com", password="StrongPassword-2026!")
        self.publication = Literature.objects.create(title="A Published Work", category="article", content="Text", is_published=True)

    def test_new_comment_is_pending_and_not_public(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/publications/{self.publication.pk}/comments/", {"content": "A thoughtful response"}, format="json")
        self.assertEqual(response.status_code, 201)
        comment = Comment.objects.get(pk=response.data["id"])
        self.assertEqual(comment.status, Comment.Status.PENDING)
        self.client.force_authenticate(user=None)
        public = self.client.get(f"/api/publications/{self.publication.pk}/comments/")
        self.assertEqual(public.data["count"], 0)

    def test_only_owner_can_delete_comment(self):
        comment = Comment.objects.create(user=self.user, publication=self.publication, content="Approved response", status=Comment.Status.APPROVED)
        other = get_user_model().objects.create_user(username="other", email="other@example.com", password="StrongPassword-2026!")
        self.client.force_authenticate(other)
        response = self.client.delete(f"/api/comments/{comment.pk}/")
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Comment.objects.filter(pk=comment.pk).exists())
