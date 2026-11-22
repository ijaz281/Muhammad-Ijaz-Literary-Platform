from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    publication = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "publication", "user", "username", "content",
                  "is_approved", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "username", "is_approved",
                            "created_at", "updated_at"]
        extra_kwargs = {"publication": {"write_only": True}}

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")
        return value
