from rest_framework.test import APITestCase
from rest_framework import status
from .models import NewsletterSubscriber


class NewsletterAPITests(APITestCase):
    def test_subscribe_and_reactivate_existing_email(self):
        first = self.client.post("/api/newsletter/subscribe/",
                                 {"email": "Reader@Example.com"}, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        subscriber = NewsletterSubscriber.objects.get()
        subscriber.is_active = False
        subscriber.save(update_fields=["is_active"])

        second = self.client.post("/api/newsletter/subscribe/",
                                  {"email": "reader@example.com"}, format="json")
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        subscriber.refresh_from_db()
        self.assertTrue(subscriber.is_active)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
