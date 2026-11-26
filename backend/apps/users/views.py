
import secrets
import logging

from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPChallenge
from .serializers import RegisterSerializer, UserSerializer


logger = logging.getLogger(__name__)

User = get_user_model()

OTP_LENGTH = 4
OTP_EXPIRY_MINUTES = 5
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


def generate_otp():
    return f"{secrets.randbelow(10000):04d}"


def send_otp_email(email, otp, purpose):
    subject = (
        "Verify Your Literary Platform Account"
        if purpose == OTPChallenge.SIGNUP
        else "Your Literary Platform Login Verification Code"
    )

    message = f"""
Hello,

Your verification code is:

{otp}

This code expires in five minutes.

If you did not request this code, please ignore this email.

Muhammad Ijaz Ul Haq - Literary Platform
"""

    sent = send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    if sent != 1:
        raise RuntimeError("Email delivery was not confirmed.")


def create_challenge(email, purpose, user=None, pending_data=None):
    otp = generate_otp()
    now = timezone.now()

    challenge = OTPChallenge.objects.create(
        purpose=purpose,
        email=email,
        user=user,
        pending_data=pending_data or {},
        otp_hash=make_password(otp),
        created_at=now,
        last_sent_at=now,
        expires_at=now + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )

    try:
        send_otp_email(email, otp, purpose)
    except Exception:
        challenge.delete()
        logger.exception("OTP email delivery failed.")
        raise

    # Remove previous challenges only after successful delivery.
    OTPChallenge.objects.filter(
        email=email,
        purpose=purpose,
    ).exclude(pk=challenge.pk).delete()

    return challenge


def validate_challenge(challenge_id, otp, purpose):
    challenge = get_object_or_404(
        OTPChallenge,
        pk=challenge_id,
        purpose=purpose,
    )

    now = timezone.now()

    if now >= challenge.expires_at:
        return None, Response(
            {"detail": "Verification code has expired. Request a new code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if challenge.attempts >= OTP_MAX_ATTEMPTS:
        return None, Response(
            {"detail": "Maximum verification attempts reached. Request a new code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    challenge.attempts += 1
    challenge.save(update_fields=["attempts"])

    if not check_password(otp, challenge.otp_hash):
        return None, Response(
            {"detail": "Incorrect verification code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return challenge, None


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = dict(serializer.validated_data)

        # Store only a password hash while signup is pending.
        data["password"] = make_password(data["password"])

        email = data["email"]

        try:
            challenge = create_challenge(
                email=email,
                purpose=OTPChallenge.SIGNUP,
                pending_data=data,
            )
        except Exception:
            return Response(
                {
                    "detail": (
                        "Unable to send verification email. "
                        "Please try again later."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "detail": "A verification code has been sent to your email.",
                "challenge_id": challenge.pk,
            },
            status=status.HTTP_200_OK,
        )


class LoginOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "This account is inactive."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = (user.email or "").strip().lower()

        if not email:
            return Response(
                {"detail": "Your account has no registered email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            challenge = create_challenge(
                email=email,
                purpose=OTPChallenge.LOGIN,
                user=user,
            )
        except Exception:
            return Response(
                {
                    "detail": (
                        "Unable to send verification email. "
                        "Please try again later."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "detail": "A login verification code has been sent to your email.",
                "challenge_id": challenge.pk,
            },
            status=status.HTTP_200_OK,
        )


class VerifySignupOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        challenge_id = request.data.get("challenge_id")
        otp = str(request.data.get("otp", "")).strip()

        if not challenge_id or len(otp) != OTP_LENGTH or not otp.isdigit():
            return Response(
                {"detail": "A valid challenge ID and four-digit OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        challenge, error = validate_challenge(
            challenge_id,
            otp,
            OTPChallenge.SIGNUP,
        )

        if error:
            return error

        data = challenge.pending_data

        if not data:
            return Response(
                {"detail": "Registration data is unavailable. Please register again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(
            email__iexact=challenge.email
        ).exists():
            challenge.delete()
            return Response(
                {"detail": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Password is already a Django password hash.
            user = User.objects.create(**data)
        except IntegrityError:
            challenge.delete()
            return Response(
                {"detail": "This username or email is already registered."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        challenge.delete()

        return Response(
            {
                "detail": "Your account has been verified and created successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class VerifyLoginOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        challenge_id = request.data.get("challenge_id")
        otp = str(request.data.get("otp", "")).strip()

        if not challenge_id or len(otp) != OTP_LENGTH or not otp.isdigit():
            return Response(
                {"detail": "A valid challenge ID and four-digit OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        challenge, error = validate_challenge(
            challenge_id,
            otp,
            OTPChallenge.LOGIN,
        )

        if error:
            return error

        user = challenge.user

        if user is None or not user.is_active:
            challenge.delete()
            return Response(
                {"detail": "The associated account is unavailable."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(user)

        challenge.delete()

        return Response(
            {
                "detail": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        challenge_id = request.data.get("challenge_id")

        challenge = get_object_or_404(
            OTPChallenge,
            pk=challenge_id,
        )

        now = timezone.now()

        elapsed = (now - challenge.last_sent_at).total_seconds()
        remaining = OTP_RESEND_SECONDS - int(elapsed)

        if remaining > 0:
            return Response(
                {
                    "detail": (
                        f"Please wait {remaining} seconds before "
                        "requesting another code."
                    )
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if challenge.user_id and not challenge.user.is_active:
            return Response(
                {"detail": "This account is inactive."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = generate_otp()

        try:
            send_otp_email(
                challenge.email,
                otp,
                challenge.purpose,
            )
        except Exception:
            logger.exception("Resending OTP email failed.")
            return Response(
                {"detail": "Unable to resend verification email."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        challenge.otp_hash = make_password(otp)
        challenge.last_sent_at = now
        challenge.expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
        challenge.attempts = 0

        challenge.save(
            update_fields=[
                "otp_hash",
                "last_sent_at",
                "expires_at",
                "attempts",
            ]
        )

        return Response(
            {"detail": "A new verification code has been sent."},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
