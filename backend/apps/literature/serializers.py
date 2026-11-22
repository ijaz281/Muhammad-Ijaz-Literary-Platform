from rest_framework import serializers
from .models import Literature


class LiteratureSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Literature
        fields = ["id", "title", "slug", "category", "language", "excerpt",
                  "content", "cover_image", "is_featured", "published_at",
                  "likes_count", "comments_count", "created_at", "updated_at"]
        read_only_fields = fields
