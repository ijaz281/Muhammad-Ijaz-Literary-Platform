from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.literature.models import Literature
from .models import PublicationLike, Bookmark
from .serializers import BookmarkSerializer


class PublicationLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        publication = get_object_or_404(Literature, slug=slug, is_published=True)
        like, created = PublicationLike.objects.get_or_create(
            user=request.user, publication=publication
        )
        return Response({
            "liked": True,
            "created": created,
            "likes_count": PublicationLike.objects.filter(publication=publication).count(),
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, slug):
        publication = get_object_or_404(Literature, slug=slug, is_published=True)
        PublicationLike.objects.filter(user=request.user, publication=publication).delete()
        return Response({
            "liked": False,
            "likes_count": PublicationLike.objects.filter(publication=publication).count(),
        })


class BookmarkToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        publication = get_object_or_404(Literature, slug=slug, is_published=True)
        bookmark, created = Bookmark.objects.get_or_create(
            user=request.user, publication=publication
        )
        return Response({"bookmarked": True, "created": created},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, slug):
        publication = get_object_or_404(Literature, slug=slug, is_published=True)
        Bookmark.objects.filter(user=request.user, publication=publication).delete()
        return Response({"bookmarked": False})


class MyBookmarksView(generics.ListAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(
            user=self.request.user, publication__is_published=True
        ).select_related("publication")
