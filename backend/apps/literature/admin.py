
from django.contrib import admin
from .models import Literature
from .forms import LiteratureAdminForm


@admin.register(Literature)
class LiteratureAdmin(admin.ModelAdmin):

    form = LiteratureAdminForm

    list_display = (
        "title",
        "category",
        "language",
        "is_published",
        "is_featured",
        "created_at",
    )

    list_filter = (
        "category",
        "language",
        "is_published",
        "is_featured",
    )

    search_fields = (
        "title",
        "content",
        "excerpt",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    class Media:
        css = {
            "all": (
                "literature/css/admin-literature.css",
            )
        }

        js = (
            "literature/js/admin-literature.js",
        )
