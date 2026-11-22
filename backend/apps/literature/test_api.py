from rest_framework.test import APITestCase
from .models import Literature


class LiteratureAPITests(APITestCase):
    def test_publication_list_hides_unpublished_entries(self):
        Literature.objects.create(title="Published", category="poetry",
                                  content="Published text", is_published=True)
        Literature.objects.create(title="Draft", category="poetry",
                                  content="Draft text", is_published=False)

        response = self.client.get("/api/literature/publications/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Published")
