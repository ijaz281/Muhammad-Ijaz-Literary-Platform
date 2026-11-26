from django.urls import path
from .views import (
    PaymentCreateView,
    JazzCashGatewayRedirectView,
    JazzCashReturnView,
    MyPaymentsView,
    RefundRequestView,
    MyRefundsView,
)

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="create-payment"),
    path(
        "jazzcash/redirect/<str:token>/",
        JazzCashGatewayRedirectView.as_view(),
        name="jazzcash-redirect",
    ),
    path("jazzcash/return/", JazzCashReturnView.as_view(), name="jazzcash-return"),
    path("my/", MyPaymentsView.as_view(), name="my-payments"),
    path("refunds/", RefundRequestView.as_view(), name="request-refund"),
    path("refunds/my/", MyRefundsView.as_view(), name="my-refunds"),
]
