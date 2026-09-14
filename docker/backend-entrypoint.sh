#!/bin/sh
set -e

mkdir -p /app/staticfiles /app/media

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-IranAPIBackend.settings}"

echo "Waiting for MongoDB connectivity..."
python - <<'PY'
import time

import django

django.setup()

from api.mongo import ping_database

for attempt in range(30):
    try:
        ping_database()
        print("MongoDB connection established.")
        break
    except Exception as exc:
        if attempt == 29:
            raise
        print(f"MongoDB unavailable ({exc}). Retrying...")
        time.sleep(1)
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"

