
from django.db import models
from django.utils.text import slugify


class BookCategory(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="bookstore/categories/",
        blank=True,
        null=True
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="subcategories"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Book Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Book(models.Model):

    class Language(models.TextChoices):
        URDU = "ur", "Urdu"
        ENGLISH = "en", "English"
        ARABIC = "ar", "Arabic"
        OTHER = "other", "Other"

    class Format(models.TextChoices):
        PAPERBACK = "paperback", "Paperback"
        HARDCOVER = "hardcover", "Hardcover"
        EBOOK = "ebook", "E-Book"
        AUDIOBOOK = "audiobook", "Audiobook"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)

    category = models.ForeignKey(
        BookCategory,
        on_delete=models.PROTECT,
        related_name="books"
    )

    authors = models.ManyToManyField(
        "profiles.AuthorProfile",
        through="BookAuthor",
        related_name="books"
    )

    description = models.TextField()
    short_description = models.TextField(blank=True)

    cover_image = models.ImageField(
        upload_to="bookstore/covers/",
        blank=True,
        null=True
    )

    isbn = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    publisher = models.CharField(max_length=200, blank=True)
    publication_date = models.DateField(blank=True, null=True)
    edition = models.CharField(max_length=100, blank=True)
    pages = models.PositiveIntegerField(default=0)

    language = models.CharField(
        max_length=10,
        choices=Language.choices,
        default=Language.ENGLISH
    )

    book_format = models.CharField(
        max_length=20,
        choices=Format.choices,
        default=Format.PAPERBACK
    )

    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    stock_quantity = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["category", "is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        if self.discount_price is not None:
            return self.discount_price
        return self.price

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    def __str__(self):
        return self.title


class BookAuthor(models.Model):
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="author_assignments"
    )

    author = models.ForeignKey(
        "profiles.AuthorProfile",
        on_delete=models.PROTECT,
        related_name="book_assignments"
    )

    author_order = models.PositiveIntegerField(default=1)
    contribution = models.CharField(max_length=100, default="Author")

    class Meta:
        ordering = ["author_order"]
        constraints = [
            models.UniqueConstraint(
                fields=["book", "author"],
                name="unique_book_author"
            )
        ]

    def __str__(self):
        return f"{self.author} - {self.book}"
