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
    && npx vite build --base /static/


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

# The default deployment image always receives the frontend built from the
# same source revision; stale checked-in bundles cannot reach production.
COPY --from=frontend-build --chown=iranapi:iranapi /frontend/dist ./frontend_static

USER iranapi

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "gunicorn IranAPIBackend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${GUNICORN_WORKERS:-3}"]
