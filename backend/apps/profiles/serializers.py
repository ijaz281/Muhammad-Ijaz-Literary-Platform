from rest_framework import serializers
from .models import AuthorProfile


class AuthorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorProfile
        fields = ["id", "full_name", "pen_name", "headline", "biography",
                  "profile_image", "cover_image", "email", "location", "website",
                  "facebook", "instagram", "youtube", "created_at", "updated_at"]
        read_only_fields = fields
