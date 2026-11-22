from django.urls import path
from .views import PublicationLikeView, BookmarkToggleView, MyBookmarksView

urlpatterns = [
    path("publications/<slug:slug>/like/", PublicationLikeView.as_view(), name="publication-like"),
    path("publications/<slug:slug>/bookmark/", BookmarkToggleView.as_view(), name="publication-bookmark"),
    path("bookmarks/", MyBookmarksView.as_view(), name="my-bookmarks"),
]
