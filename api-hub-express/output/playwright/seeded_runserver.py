import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "IranAPIBackend.settings")

import django
from django.core.management import execute_from_command_line

django.setup()

from api.seed import seed_sample_data

print(seed_sample_data(force=True), flush=True)
execute_from_command_line(["manage.py", "runserver", "127.0.0.1:8000", "--noreload"])
