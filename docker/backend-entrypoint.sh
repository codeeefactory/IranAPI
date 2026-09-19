#!/bin/sh
set -e

mkdir -p /app/staticfiles /app/media
mkdir -p /data/db

DBPATH=/data/db
rm -f "$DBPATH/mongod.lock"

case "${IRANAPI_MONGODB_URI:-mongodb://localhost:27017/}" in
  mongodb://localhost:*|mongodb://127.0.0.1:*)
    echo "Starting embedded MongoDB (127.0.0.1:27017)..."
    # Do not use --fork in managed containers. Some runtimes clean up the
    # daemonized child after entrypoint, leaving Django with a refused port.
    mongod --dbpath "$DBPATH" --bind_ip 127.0.0.1 --port 27017 --quiet &
    MONGOD_PID=$!
    trap 'kill "$MONGOD_PID" 2>/dev/null || true' TERM INT EXIT
    ;;
  *)
    echo "Using configured external MongoDB."
    ;;
esac

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-IranAPIBackend.settings}"

# Keep production images secure without baking a shared signing key into the
# image. Operators may provide DJANGO_SECRET_KEY; otherwise create one once on
# the persistent service volume so sessions survive container replacements.
if [ "${DJANGO_DEBUG:-false}" != "true" ] && [ -z "${DJANGO_SECRET_KEY:-}" ]; then
  SECRET_FILE="${IRANAPI_SECRET_FILE:-/data/db/.django_secret_key}"
  if [ ! -s "$SECRET_FILE" ]; then
    umask 077
    python -c 'import secrets; print(secrets.token_urlsafe(64))' > "$SECRET_FILE"
  fi
  DJANGO_SECRET_KEY="$(cat "$SECRET_FILE")"
  export DJANGO_SECRET_KEY
  echo "Loaded the generated Django secret from the persistent service volume."
fi

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
