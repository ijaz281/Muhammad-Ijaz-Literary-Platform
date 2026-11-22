from rest_framework import serializers
from .models import Book, BookCategory, BookAuthor


class BookCategorySerializer(serializers.ModelSerializer):
    subcategories_count = serializers.SerializerMethodField()

    class Meta:
        model = BookCategory
        fields = ["id", "name", "slug", "description", "image", "parent",
                  "subcategories_count"]

    def get_subcategories_count(self, obj):
        return obj.subcategories.filter(is_active=True).count()


class BookAuthorSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    pen_name = serializers.CharField(source="author.pen_name", read_only=True)

    class Meta:
        model = BookAuthor
        fields = ["id", "author", "author_name", "pen_name",
                  "author_order", "contribution"]


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    authors = BookAuthorSerializer(source="author_assignments", many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Book
        fields = ["id", "title", "slug", "category", "category_name", "category_slug",
                  "authors", "description", "short_description", "cover_image", "isbn",
                  "publisher", "publication_date", "edition", "pages", "language",
                  "book_format", "price", "discount_price", "current_price",
                  "stock_quantity", "is_in_stock", "is_active", "is_featured",
                  "created_at", "updated_at"]
        read_only_fields = fields

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        discount = attrs.get("discount_price", getattr(self.instance, "discount_price", None))
        if discount is not None and price is not None and discount > price:
            raise serializers.ValidationError({
                "discount_price": "Discount price cannot exceed regular price."
            })
        return attrs
