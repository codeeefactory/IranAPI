from django.apps import AppConfig
from django.conf import settings
import sys


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        if any(arg in {"check", "test", "makemigrations", "migrate"} for arg in sys.argv):
            return
        if getattr(settings, "AUTO_SEED_SAMPLE_DATA", False):
            from .seed import seed_sample_data

            seed_sample_data()
