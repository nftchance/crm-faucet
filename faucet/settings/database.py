import os

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

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATA_UPLOAD_MAX_NUMBER_FIELDS = 30000

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 100,
}