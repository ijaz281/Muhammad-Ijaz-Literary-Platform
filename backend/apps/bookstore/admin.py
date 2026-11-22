
from django.contrib import admin
from .models import BookCategory, Book, BookAuthor


@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


class BookAuthorInline(admin.TabularInline):
    model = BookAuthor
    extra = 1
    autocomplete_fields = ("author",)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "price",
        "discount_price",
        "stock_quantity",
        "language",
        "book_format",
        "is_featured",
        "is_active",
    )

    list_filter = (
        "category",
        "language",
        "book_format",
        "is_active",
        "is_featured",
    )

    search_fields = (
        "title",
        "isbn",
        "publisher",
        "authors__full_name",
    )

    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category",)
    inlines = [BookAuthorInline]

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "title",
                "slug",
                "category",
                "description",
                "short_description",
                "cover_image",
            )
        }),
        ("Publication Details", {
            "fields": (
                "isbn",
                "publisher",
                "publication_date",
                "edition",
                "pages",
                "language",
                "book_format",
            )
        }),
        ("Pricing and Inventory", {
            "fields": (
                "price",
                "discount_price",
                "stock_quantity",
            )
        }),
        ("Visibility", {
            "fields": (
                "is_active",
                "is_featured",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )


@admin.register(BookAuthor)
class BookAuthorAdmin(admin.ModelAdmin):
    list_display = ("book", "author", "author_order", "contribution")
    list_filter = ("contribution",)
    search_fields = ("book__title", "author__full_name")
    autocomplete_fields = ("book", "author")
