#!/bin/sh
set -e

mkdir -p /app/staticfiles /app/media

if [ -z "${MONGODB_URI:-}" ] && [ -z "${MONGODB_USE_MOCK:-}" ]; then
    export MONGODB_USE_MOCK=true
    export IRANAPI_AUTO_SEED_SAMPLE_DATA="${IRANAPI_AUTO_SEED_SAMPLE_DATA:-true}"
    echo "MONGODB_URI is not set; using the in-memory mock database."
fi

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-IranAPIBackend.settings}"

if [ "${MONGODB_USE_MOCK:-false}" = "true" ] && [ -z "${GUNICORN_WORKERS:-}" ]; then
    export GUNICORN_WORKERS=1
    echo "MONGODB_USE_MOCK is enabled; defaulting Gunicorn to a single worker."
fi

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
python manage.py collectstatic --noinput

exec "$@"

