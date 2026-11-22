
from django.db import models


class AuthorProfile(models.Model):
    full_name = models.CharField(max_length=200)
    pen_name = models.CharField(max_length=200, blank=True)

    headline = models.CharField(max_length=255, blank=True)
    biography = models.TextField()

    profile_image = models.ImageField(
        upload_to="author/profile/",
        blank=True,
        null=True
    )

    cover_image = models.ImageField(
        upload_to="author/cover/",
        blank=True,
        null=True
    )

    email = models.EmailField(blank=True)
    location = models.CharField(max_length=150, blank=True)

    website = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    youtube = models.URLField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Author Profile"
        verbose_name_plural = "Author Profile"

    def __str__(self):
        return self.full_name
