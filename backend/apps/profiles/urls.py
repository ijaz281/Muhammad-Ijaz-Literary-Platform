from rest_framework.routers import DefaultRouter
from .views import AuthorProfileViewSet

router = DefaultRouter()
router.register("authors", AuthorProfileViewSet, basename="author-profile")
urlpatterns = router.urls
