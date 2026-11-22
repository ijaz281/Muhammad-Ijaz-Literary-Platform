from decimal import Decimal
from rest_framework.test import APITestCase
from .models import Book, BookCategory


class BookstoreAPITests(APITestCase):
    def test_public_book_list_only_returns_active_books(self):
        category = BookCategory.objects.create(name="Poetry")
        Book.objects.create(title="Visible Book", category=category, description="A book",
                            price=Decimal("100.00"), stock_quantity=2, is_active=True)
        Book.objects.create(title="Hidden Book", category=category, description="A book",
                            price=Decimal("100.00"), stock_quantity=2, is_active=False)

        response = self.client.get("/api/books/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Visible Book")
