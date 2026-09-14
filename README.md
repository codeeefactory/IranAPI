# IranAPI Hub

IranAPI is a Persian-first API marketplace with a React frontend, Django REST backend, secure server-side provider caller, and MongoDB as its only runtime database.

## Features

- Curated Iranian providers: Neshan, Kavenegar, ZarinPal, and ArvanCloud
- Searchable API catalog, pricing, documentation, ratings, and access grants
- Account dashboard, usage tracking, subscription checkout, organizations, Studio flows, project generation, and compressed API-project analysis/deployment
- Runnable per-endpoint call examples for Java, JavaScript, TypeScript, Python, C++, and C#
- Real provider calls through a server-controlled allowlist; provider credentials never reach the browser
- Persian/RTL interface and responsive Django administration console
- MongoDB-backed Django Admin/Auth/Sessions and operational document collections

## Stack

- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query
- Backend: Python 3.12, Django 6.0, Django REST Framework
- Database: MongoDB 8.0, official Django MongoDB Backend, PyMongo
- Runtime: Docker Compose or local Python/Node processes

## Docker setup

1. Copy `.env.example` to `.env` and replace all placeholder secrets.
2. Start the stack:

   ```bash
   docker compose up --build
   ```

3. Open:

   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000/api/v1/`
   - Health: `http://localhost:8000/api/v1/system/health/`
   - Admin: `http://localhost:8000/admin/`

MongoDB data is persisted in the named `iranapi_mongodb_data` volume. The backend waits for a successful MongoDB ping, applies Mongo-compatible migrations, creates indexes, and then starts. The `deployer` service consumes the project queue, builds each uploaded archive as a Docker image, starts it with CPU/memory/process/capability limits, and publishes its live URL. In production, run this untrusted-code worker and its Docker daemon on a dedicated isolated host.

Create an admin account inside the backend container:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Local setup

Run MongoDB first, then configure these environment variables:

```text
IRANAPI_MONGODB_URI=mongodb://localhost:27017/
IRANAPI_MONGODB_DATABASE=iranapi
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=true
```

Install and initialize:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_persian_apis
python manage.py runserver
```

In another terminal:

```bash
cd api-hub-express
npm ci
npm run dev
```

## CLI

The Node.js 20+ CLI lives in `iranapi-cli/` and installs the `iranapi` command:

```bash
cd iranapi-cli
npm ci
npm test
npm install --global .
iranapi doctor
```

Browse the catalog and call any public HTTP(S) API allowed by the backend caller policy:

```bash
iranapi apis list --search maps --limit 10
iranapi docs search authentication --api neshan-maps
iranapi call GET https://httpbin.org/get --json
```

Analyze or deploy compressed API projects (`.zip`, `.tar`, `.tar.gz`, `.tgz`):

```bash
iranapi analyze ./my-api.zip --json
iranapi deploy ./my-api.tar.gz --name "My API" --region ir-tehran-1 --json
```

Deploy waits for the worker to return a live URL. Use `--no-wait` for queue-only automation, or `--timeout <seconds>` to change the build deadline.

Use `iranapi login` for browser sign-in, or `iranapi login --token <token>` for automation. Credential precedence is `--token`, `IRANAPI_TOKEN`, then `~/.iranapi/config.json`.

## Real API caller

Set only the credentials for providers you want to call:

```text
NESHAN_SERVICE_KEY=
KAVENEGAR_API_KEY=
ZARINPAL_MERCHANT_ID=
ARVANCLOUD_API_KEY=
```

Direct calls to arbitrary public HTTP(S) URLs use `/api/v1/public/caller/` without an IranAPI account. Catalog calls with server-managed provider credentials need an active access grant and authentication through the Mongo-backed session cookie, a compatibility token, or the one-time `iapi_...` key created in the dashboard:

```bash
curl -X POST http://localhost:8000/api/v1/account/caller/ \
  -H "Authorization: Bearer $IRANAPI_KEY" \
  -H "Content-Type: application/json" \
  --data '{"api_slug":"neshan-maps","endpoint_id":1,"method":"GET","path":"/v3/search","query":{"term":"تهران","lat":35.7,"lng":51.4}}'
```

The backend chooses the upstream host, exact catalog endpoint, authentication method, timeouts, and response-size limit. Browser input cannot override provider hosts or credentials.

## Social sign-in configuration

Google and GitHub buttons are deliberately disabled until an authorization URL is configured. Set the complete URL supplied by your OAuth provider/broker in the backend environment, then rebuild the backend:

```text
IRANAPI_GITHUB_AUTH_URL=https://github.com/login/oauth/authorize?...
IRANAPI_GOOGLE_AUTH_URL=
```

Do not commit client secrets or URLs containing sensitive values. An empty variable is expected in local development and shows a clear “not configured” message instead of attempting a broken redirect.

## Tests

Tests use a dedicated MongoDB database named `test_iranapi` by default:

```bash
python manage.py test
cd api-hub-express
npm run lint
npm run build
npx playwright test
```

Never point tests at a production database. `reset_database()` refuses to clear a database unless its name starts with `test_` or `IRANAPI_MONGODB_ALLOW_RESET=true` is explicitly set.

See [Persian API seed guide](docs/persian-api-catalog.md) for catalog details.
