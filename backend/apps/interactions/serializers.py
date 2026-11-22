from rest_framework import serializers
from .models import Bookmark
from apps.literature.models import Literature


class BookmarkSerializer(serializers.ModelSerializer):
    publication_title = serializers.CharField(source="publication.title", read_only=True)
    publication_slug = serializers.CharField(source="publication.slug", read_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "publication", "publication_title", "publication_slug", "created_at"]
        read_only_fields = fields
