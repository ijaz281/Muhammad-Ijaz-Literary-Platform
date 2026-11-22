
from django.contrib import admin
from .models import PublicationLike, Bookmark


@admin.register(PublicationLike)
class PublicationLikeAdmin(admin.ModelAdmin):
    list_display = ("user", "publication", "created_at")
    search_fields = ("user__username", "publication__title")


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("user", "publication", "created_at")
    search_fields = ("user__username", "publication__title")
