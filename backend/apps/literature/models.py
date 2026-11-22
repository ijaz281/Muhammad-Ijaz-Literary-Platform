
from django.db import models
from django.utils.text import slugify


class Literature(models.Model):

    class Category(models.TextChoices):
        POETRY = "poetry", "Poetry"
        FLASH_FICTION = "flash_fiction", "Flash Fiction"
        ARTICLE = "article", "Article"
        BLOG = "blog", "Blog"
        QUOTE = "quote", "Philosophical Quote"

    class Language(models.TextChoices):
        URDU = "ur", "Urdu"
        ENGLISH = "en", "English"

    title = models.CharField(max_length=255)

    slug = models.SlugField(
        max_length=280,
        unique=True,
        blank=True
    )

    category = models.CharField(
        max_length=30,
        choices=Category.choices
    )

    language = models.CharField(
        max_length=5,
        choices=Language.choices,
        default=Language.ENGLISH
    )

    excerpt = models.TextField(
        blank=True,
        help_text="Short description of the publication."
    )

    content = models.TextField()

    cover_image = models.ImageField(
        upload_to="literature/covers/",
        blank=True,
        null=True
    )

    is_published = models.BooleanField(default=False)

    is_featured = models.BooleanField(default=False)

    published_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Literary Publication"
        verbose_name_plural = "Literary Publications"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
