import os

from django.core.management.utils import get_random_secret_key

LOCAL = os.getenv("LOCAL", False)

DEBUG = os.getenv("DEBUG", True)

SECRET_KEY = os.getenv("SECRET_KEY", "secret_key")
