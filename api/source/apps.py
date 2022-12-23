import os

from django.apps import AppConfig
from django.conf import settings

class SourceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "source"

    def ready(self):
        if os.environ.get("RUN_MAIN") or not settings.DEBUG:
            from .scripts import JobManager

            manager = JobManager()
            manager.ready()