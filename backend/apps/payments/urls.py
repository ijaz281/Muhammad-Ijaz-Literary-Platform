from django.urls import path
from .views import (
    PaymentCreateView, MyPaymentsView, RefundRequestView, MyRefundsView,
    PaymentConfigurationView, PaymentProofUploadView, PaymentProofView,
)

urlpatterns = [
    path("configuration/", PaymentConfigurationView.as_view(), name="payment-configuration"),
    path("proof/<uuid:order_number>/", PaymentProofUploadView.as_view(), name="payment-proof-upload"),
    path("<int:payment_id>/proof/", PaymentProofView.as_view(), name="payment-proof-view"),
    path("create/", PaymentCreateView.as_view(), name="create-payment"),
    path("my/", MyPaymentsView.as_view(), name="my-payments"),
    path("refunds/", RefundRequestView.as_view(), name="request-refund"),
    path("refunds/my/", MyRefundsView.as_view(), name="my-refunds"),
]
