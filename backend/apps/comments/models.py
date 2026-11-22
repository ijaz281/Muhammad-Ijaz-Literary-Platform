from django.conf import settings
from django.db import models


class Comment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    publication = models.ForeignKey(
        "literature.Literature", on_delete=models.CASCADE, related_name="comments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="literary_comments"
    )
    content = models.TextField(max_length=3000)
    # Kept for backwards compatibility with existing code and database rows.
    is_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["publication", "status", "created_at"])]

    def save(self, *args, **kwargs):
        self.is_approved = self.status == self.Status.APPROVED
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Comment by {self.user} on {self.publication}"
