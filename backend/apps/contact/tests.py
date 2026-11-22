from rest_framework.test import APITestCase
from rest_framework import status
from .models import ContactMessage


class ContactAPITests(APITestCase):
    def test_contact_message_is_saved(self):
        response = self.client.post("/api/contact/", {
            "name": "Test Reader",
            "email": "reader@example.com",
            "subject": "A question",
            "message": "I would like to ask about a book.",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertFalse(ContactMessage.objects.first().is_read)
