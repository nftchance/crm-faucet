import os

from django.apps import AppConfig


class SourceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "source"

    def ready(self):
        if os.environ.get("RUN_MAIN"):
            from .jobs import manager