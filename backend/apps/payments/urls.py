from django.urls import path
from .views import PaymentCreateView, MyPaymentsView, RefundRequestView, MyRefundsView

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="create-payment"),
    path("my/", MyPaymentsView.as_view(), name="my-payments"),
    path("refunds/", RefundRequestView.as_view(), name="request-refund"),
    path("refunds/my/", MyRefundsView.as_view(), name="my-refunds"),
]
