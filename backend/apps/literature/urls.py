
from rest_framework.routers import DefaultRouter

from .views import LiteratureViewSet

router = DefaultRouter()

router.register(
    "publications",
    LiteratureViewSet,
    basename="literature"
)

urlpatterns = router.urls
