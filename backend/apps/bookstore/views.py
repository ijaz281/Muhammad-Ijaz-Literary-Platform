
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import Book, BookCategory
from .serializers import (
    BookSerializer,
    BookCategorySerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48


class BookCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookCategorySerializer
    permission_classes = [AllowAny]

    queryset = BookCategory.objects.filter(
        is_active=True
    ).select_related("parent").prefetch_related(
        "subcategories"
    )

    lookup_field = "slug"


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    queryset = Book.objects.filter(
        is_active=True
    ).select_related(
        "category"
    ).prefetch_related(
        "author_assignments__author"
    )

    lookup_field = "slug"

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "description",
        "short_description",
        "publisher",
        "isbn",
        "authors__full_name",
        "authors__pen_name",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "title",
        "publication_date",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()

        category = self.request.query_params.get("category")
        language = self.request.query_params.get("language")
        book_format = self.request.query_params.get("format")
        featured = self.request.query_params.get("featured")
        in_stock = self.request.query_params.get("in_stock")

        if category:
            queryset = queryset.filter(
                category__slug=category
            )

        if language:
            queryset = queryset.filter(
                language=language
            )

        if book_format:
            queryset = queryset.filter(
                book_format=book_format
            )

        if featured == "true":
            queryset = queryset.filter(is_featured=True)

        if in_stock == "true":
            queryset = queryset.filter(stock_quantity__gt=0)

        return queryset.distinct()
