
from django.db import models
from django.conf import settings


class PublicationLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    publication = models.ForeignKey(
        "literature.Literature",
        on_delete=models.CASCADE,
        related_name="likes"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "publication"],
                name="unique_publication_like"
            )
        ]

    def __str__(self):
        return f"{self.user} likes {self.publication}"


class Bookmark(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    publication = models.ForeignKey(
        "literature.Literature",
        on_delete=models.CASCADE,
        related_name="bookmarks"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "publication"],
                name="unique_publication_bookmark"
            )
        ]

    def __str__(self):
        return f"{self.user} bookmarked {self.publication}"
