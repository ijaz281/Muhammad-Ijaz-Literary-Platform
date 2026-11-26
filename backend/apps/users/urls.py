
from django.urls import path

from .views import (
    RegisterView,
    LoginOTPView,
    VerifySignupOTPView,
    VerifyLoginOTPView,
    ResendOTPView,
    MeView,
)

urlpatterns = [
    path("token/", LoginOTPView.as_view(), name="otp-login"),
    path("register/", RegisterView.as_view(), name="register"),

    path(
        "verify-signup/",
        VerifySignupOTPView.as_view(),
        name="verify-signup",
    ),

    path(
        "verify-login/",
        VerifyLoginOTPView.as_view(),
        name="verify-login",
    ),

    path(
        "otp/resend/",
        ResendOTPView.as_view(),
        name="resend-otp",
    ),

    path("me/", MeView.as_view(), name="current-user"),
]
