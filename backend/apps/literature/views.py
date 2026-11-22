from django.db.models import Count, Q
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from .models import Literature
from .serializers import LiteratureSerializer


class LiteraturePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 40


class LiteratureViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LiteratureSerializer
    permission_classes = [AllowAny]
    pagination_class = LiteraturePagination
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["created_at", "published_at", "title"]
    ordering = ["-published_at", "-created_at"]

    def get_queryset(self):
        queryset = Literature.objects.filter(is_published=True).annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", filter=Q(comments__is_approved=True), distinct=True),
        )
        params = self.request.query_params
        if params.get("category"):
            queryset = queryset.filter(category=params["category"])
        if params.get("language"):
            queryset = queryset.filter(language=params["language"])
        if params.get("featured", "").lower() in ("true", "1", "yes"):
            queryset = queryset.filter(is_featured=True)
        return queryset
