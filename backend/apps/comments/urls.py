from django.urls import path
from .views import PublicationCommentListCreateView

urlpatterns = [
    path("publications/<int:publication_id>/comments/",
         PublicationCommentListCreateView.as_view(), name="publication-comments"),
]
