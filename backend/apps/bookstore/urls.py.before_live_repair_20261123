
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, BookCategoryViewSet

router = DefaultRouter()

router.register(
    "categories",
    BookCategoryViewSet,
    basename="book-category"
)

router.register(
    "books",
    BookViewSet,
    basename="book"
)

urlpatterns = router.urls
