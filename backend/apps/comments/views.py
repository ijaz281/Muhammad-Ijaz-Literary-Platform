from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound
from .models import Comment
from .serializers import CommentSerializer
from apps.literature.models import Literature


class PublicationCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        publication_id = self.kwargs["publication_id"]
        return Comment.objects.filter(
            publication_id=publication_id,
            publication__is_published=True,
            is_approved=True
        ).select_related("user")

    def perform_create(self, serializer):
        publication = Literature.objects.filter(
            pk=self.kwargs["publication_id"], is_published=True
        ).first()
        if not publication:
            raise NotFound("Publication not found.")
        serializer.save(user=self.request.user, publication=publication)
