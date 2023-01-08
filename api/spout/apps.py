import os

from django.apps import AppConfig
from django.conf import settings

class SpoutConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'spout'

    def ready(self):
        if os.environ.get('RUN_MAIN') or not settings.DEBUG:
            # Once imported, the jobs module will register the jobs and just run.
            from . import jobs
