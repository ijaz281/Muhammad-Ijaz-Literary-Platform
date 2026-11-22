from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("publication", "user", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("content", "user__username", "publication__title")
    list_editable = ("status",)
    readonly_fields = ("created_at", "updated_at")
