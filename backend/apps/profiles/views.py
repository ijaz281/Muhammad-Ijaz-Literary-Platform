from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from .models import AuthorProfile
from .serializers import AuthorProfileSerializer


class AuthorProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuthorProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = "pk"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "pen_name", "headline", "biography", "location"]
    ordering_fields = ["full_name", "created_at"]
    ordering = ["full_name"]

    def get_queryset(self):
        return AuthorProfile.objects.filter(is_active=True)
