import os

from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-ftet4hy2iehpe#7l-dga#f3%t)o_704%3lamh1n7*)qynxgtu@"

DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party apps
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_apscheduler",
    # first party app
    "generator",
    "source",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "faucet.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "faucet.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("PGDATABASE", "faucet"),
        "USER": os.getenv("PGUSER", "faucet"),
        "PASSWORD": os.getenv("PGPASSWORD", "faucet"),
        "HOST": os.getenv("PGHOST", "host.docker.internal"),
        "PORT": os.getenv("PGPORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 5,
}

MINUTES_TO_STALL = 3

TESTNET_CONTRACT_ADDRESS = os.getenv(
    "TESTNET_CONTRACT_ADDRESS", "TESTNET_CONTRACT_ADDRESS"
)
MAINNET_CONTRACT_ADDRESS = os.getenv(
    "MAINNET_CONTRACT_ADDRESS", "MAINNET_CONTRACT_ADDRESS"
)

ALCHEMY_KEY = os.getenv("ALCHEMY_KEY", "ALCHEMY_KEY")
PROVIDER = (
    f"https://eth-mainnet.alchemyapi.io/v2/{ALCHEMY_KEY}"
    if not DEBUG
    else "https://rpc.sepolia.org"
)
MAINNET_PROVIDER = f"https://eth-mainnet.alchemyapi.io/v2/{ALCHEMY_KEY}"
CONTRACT_ADDRESS = MAINNET_CONTRACT_ADDRESS if not DEBUG else TESTNET_CONTRACT_ADDRESS

SIGNER_ADDRESS = os.getenv("SIGNER_ADDRESS", "SIGNER_ADDRESS")
SIGNER_PRIVATE_KEY = f"{os.getenv('SIGNER_PRIVATE_KEY', 'SIGNER_PRIVATE_KEY')}" ""