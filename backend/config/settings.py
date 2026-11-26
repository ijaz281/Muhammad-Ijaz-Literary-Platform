
"""
Django settings for Muhammad Ijaz Ul Haq Literary Platform.
Django 5.2.19
"""

from pathlib import Path
import os
from dotenv import load_dotenv


# ============================================================
# BASE DIRECTORY AND ENVIRONMENT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env
load_dotenv(BASE_DIR / ".env")


# ============================================================
# SECURITY SETTINGS
# ============================================================

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-development-key-change-before-production"
)

DEBUG = os.getenv("DEBUG", "True").strip().lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "127.0.0.1,localhost"
    ).split(",")
    if host.strip()
]

if DEBUG:
    ALLOWED_HOSTS.extend(["testserver"])


# ============================================================
# APPLICATIONS
# ============================================================

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
]

LOCAL_APPS = [
    "apps.users",
    "apps.profiles",
    "apps.literature",
    "apps.interactions",
    "apps.comments",
    "apps.bookstore",
    "apps.orders",
    "apps.payments",
    "apps.contact",
    "apps.newsletter",
    "apps.analytics",
]

INSTALLED_APPS = (
    DJANGO_APPS
    + THIRD_PARTY_APPS
    + LOCAL_APPS
)


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL AND TEMPLATE CONFIGURATION
# ============================================================

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# DATABASE
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Karachi"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    # JWT Authentication
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],

    # Default API permissions
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],

    # Pagination
    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination.PageNumberPagination"
    ),

    "PAGE_SIZE": 12,

    # Search and ordering
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}



# ============================================================
# CORS CONFIGURATION
# ============================================================

CORS_ALLOWED_ORIGINS = [
    "https://muhammad-ijaz-literary-platform.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow authorization headers for JWT authentication.
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]



# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================
# AUTHENTICATION TOKEN LIFETIME
# ============================================================

from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
}

# Optional deployment settings can be supplied through environment variables.
# Never enable wildcard hosts or disable HTTPS protections on a public deployment.
if not DEBUG:
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_REFERRER_POLICY = "same-origin"

# Server-controlled flat shipping fee (PKR); clients cannot override checkout pricing.
LITERARY_SHIPPING_FEE = os.getenv("LITERARY_SHIPPING_FEE", "0.00")


# Manual payment destinations: fill these in backend/.env on the server.
MANUAL_PAYMENT_DETAILS = {
    "jazzcash": {
        "account_title": os.getenv("JAZZCASH_ACCOUNT_TITLE", "MUHAMMAD Shop"),
        "account_number": os.getenv("JAZZCASH_TILL_ID", "985063409"),
        "instructions": os.getenv("JAZZCASH_INSTRUCTIONS", "Dial *786*10# in JazzCash and enter the Till ID, then pay the exact order amount."),
    },
    "easypaisa": {
        "account_title": os.getenv("EASYPAISA_ACCOUNT_TITLE", ""),
        "account_number": os.getenv("EASYPAISA_ACCOUNT_NUMBER", ""),
        "instructions": os.getenv("EASYPAISA_INSTRUCTIONS", "Send the exact order amount using Easypaisa, then upload your transaction receipt."),
    },
    "raast": {
        "account_title": os.getenv("RAAST_ACCOUNT_TITLE", "MUHAMMAD Shop"),
        "account_number": os.getenv("RAAST_ID", ""),
        "qr_image_url": os.getenv("RAAST_QR_IMAGE_URL", ""),
        "instructions": os.getenv("RAAST_INSTRUCTIONS", "Scan the supplied merchant QR code and pay the exact order amount, then upload your transaction receipt."),
    },
}
PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024
