import os

from django.apps import AppConfig


class GeneratorConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "generator"

    def ready(self):
        if os.environ.get("RUN_MAIN"):
            from .jobs import manager
