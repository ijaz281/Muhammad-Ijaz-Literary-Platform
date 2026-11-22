
from django.contrib import admin
from .models import AuthorProfile


@admin.register(AuthorProfile)
class AuthorProfileAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "pen_name",
        "is_active",
        "updated_at",
    )

    list_filter = ("is_active",)
    search_fields = ("full_name", "pen_name")
