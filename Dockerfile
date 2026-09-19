FROM docker:29-cli AS docker-cli

FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-build

WORKDIR /frontend

COPY api-hub-express/package.json api-hub-express/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY api-hub-express/index.html ./index.html
COPY api-hub-express/components.json ./components.json
COPY api-hub-express/postcss.config.js ./postcss.config.js
COPY api-hub-express/tailwind.config.ts ./tailwind.config.ts
COPY api-hub-express/tsconfig.json ./tsconfig.json
COPY api-hub-express/tsconfig.app.json ./tsconfig.app.json
COPY api-hub-express/tsconfig.node.json ./tsconfig.node.json
COPY api-hub-express/vite.config.ts ./vite.config.ts
COPY api-hub-express/eslint.config.js ./eslint.config.js
COPY api-hub-express/public ./public
COPY api-hub-express/src ./src

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN test -f src/lib/utils.ts \
    && npx vite build


FROM public.ecr.aws/docker/library/python:3.12-slim AS backend-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=8

WORKDIR /app

RUN groupadd --system iranapi \
    && useradd --system --gid iranapi --create-home --home-dir /home/iranapi iranapi \
    && rm -rf /var/lib/apt/lists/*

# Embedded MongoDB server so the single Docker service is self-contained:
# the app runs with no external Mongo dependency (its Mongo URI defaults to
# mongodb://localhost:27017, and the entrypoint boots a local mongod first).
RUN apt-get update \
    && apt-get install --no-install-recommends -y gnupg curl ca-certificates \
    && curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
        | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
        > /etc/apt/sources.list.d/mongodb-org-8.0.list \
    && apt-get update \
    && apt-get install --no-install-recommends -y mongodb-org-server \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data/db \
    && chown -R iranapi:iranapi /data/db

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=iranapi:iranapi manage.py ./manage.py
COPY --chown=iranapi:iranapi IranAPIBackend ./IranAPIBackend
COPY --chown=iranapi:iranapi api ./api
COPY --chown=iranapi:iranapi mongo_migrations ./mongo_migrations
COPY docker/backend-entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh \
    && mkdir -p /app/staticfiles /app/media \
    && chown -R iranapi:iranapi /app /entrypoint.sh

EXPOSE 8000


FROM backend-base AS backend-runtime

USER iranapi

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "gunicorn IranAPIBackend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${GUNICORN_WORKERS:-3}"]


FROM backend-base AS deployer-runtime

USER root

COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker-cli /usr/local/libexec/docker/cli-plugins /usr/local/libexec/docker/cli-plugins

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "run_project_deployer"]


FROM public.ecr.aws/docker/library/nginx:1.27-alpine AS frontend-runtime

COPY api-hub-express/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM backend-base AS app-runtime

# Cache-bust: bump to force Runflare to rebuild the image layer
ARG DEPLOY_TS=2026-09-19T0830

# Runflare routes this Docker service to port 80. Keep the application as the
# unprivileged iranapi user while granting only Python's low-port bind ability.
USER root
RUN apt-get update \
    && apt-get install --no-install-recommends -y libcap2-bin \
    && setcap 'cap_net_bind_service=+ep' /usr/local/bin/python3.12 \
    && rm -rf /var/lib/apt/lists/*

# The default deployment image always receives the frontend built from the
# same source revision; stale checked-in bundles cannot reach production.
COPY --from=frontend-build --chown=iranapi:iranapi /frontend/dist ./frontend_static

# Cloud deployments boot against a fresh embedded MongoDB; seed the demo
# catalog (categories + sample APIs) so the hub is immediately navigable.
ENV IRANAPI_AUTO_SEED_SAMPLE_DATA=true
ENV DJANGO_DEBUG=false
ENV IRANAPI_TRUST_PROXY_SSL_HEADER=true

USER iranapi

EXPOSE 80 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "gunicorn IranAPIBackend.wsgi:application --bind 0.0.0.0:80 --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}"]
