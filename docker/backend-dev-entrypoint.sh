#!/bin/sh
set -e

mkdir -p /app/staticfiles /app/media

echo "Waiting for MongoDB connectivity..."
python - <<'PY'
import time

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
exec python manage.py runserver 0.0.0.0:8000
