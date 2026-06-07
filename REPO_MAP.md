# Repo Map

Checkpoint: 0 - repo inspection only
Date: 2026-06-07

## Stack

- Frontend: React 18, TypeScript, Vite.
- Frontend routing: `react-router-dom` in `api-hub-express/src/App.tsx`, with route files under `api-hub-express/src/routes/`.
- Frontend styling: Tailwind CSS v4, shadcn/Radix UI components, site-specific terminal UI components under `api-hub-express/src/components/site/`.
- Frontend data layer: TanStack Query installed; current refreshed UI also uses local mock data in `api-hub-express/src/data/mock.ts`.
- Backend: Django 5.2.8 with Django REST Framework.
- Backend routing: Django URLconf in `IranAPIBackend/urls.py`, app routes in `api/urls.py`.
- Backend data model: Django models in `api/models.py`; repository layer also exists in `api/repositories.py` for non-model/document-style access.
- Database: SQLite expected for development from README; migrations exist in `api/migrations/`.
- Auth: Django auth user model, DRF token compatibility, cookie/session-style auth routes under `/api/v1/auth/*`, social provider stubs.
- Tests: Django test module at `api/tests.py`; no frontend test runner detected in `api-hub-express/package.json`.

## Package Managers

- Frontend: npm, lockfile at `api-hub-express/package-lock.json`.
- Backend: pip requirements in `requirements.txt`.

## Commands Found

Frontend, from `api-hub-express/package.json`:

```bash
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
```

Backend:

```bash
python manage.py runserver
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py migrate
```

Docker:

```bash
docker compose up --build
```

## Existing Routes

Frontend routes in `api-hub-express/src/App.tsx`:

- `/`
- `/browse`
- `/api/:slug`
- `/pricing`
- `/payment`
- `/documentation`
- `/dashboard`
- `/studio`
- `/caller`
- `/cli`
- `/org/organizations/create`
- `/signin`
- `/signup`
- `/terms`
- `/privacy`
- fallback redirects to `/`

Backend API routes in `api/urls.py`:

- Health/schema: `/api/health/`, `/api/v1/system/health/`, `/api/v1/schema/openapi.json`
- Auth/session: `/api/auth/*`, `/api/v1/auth/*`
- Account/profile: `/api/profile/me/`, `/api/v1/account/*`
- Usage: `/api/usage/`, `/api/usage/stats/`, `/api/v1/account/usage/*`
- Catalog: `/api/categories/`, `/api/apis/`, `/api/pricing-plans/`, `/api/documentations/`
- Versioned catalog: `/api/v1/catalog/categories/`, `/api/v1/catalog/apis/`, `/api/v1/catalog/pricing-plans/`, `/api/v1/catalog/subscription-plans/`, `/api/v1/catalog/documentations/`
- API detail helpers: `/api/v1/catalog/apis/<slug>/similar/`, `/ratings/`, `/plans/`, `/docs/`, `/endpoints/`

## Existing API/Server Structure

- `IranAPIBackend/settings.py`: Django settings.
- `IranAPIBackend/urls.py`: admin, API include, frontend fallback helpers, robots/sitemap.
- `api/models.py`: `Category`, `API`, `PricingPlan`, `Documentation`, `UserProfile`, `APIUsage`.
- `api/serializers.py`: DRF serializers plus custom serialization helpers.
- `api/views.py`: DRF class-based views and viewsets for auth, catalog, subscription, usage, docs.
- `api/repositories.py`: repository abstraction used by newer class-based views.
- `api/seed.py`: seed/mock-style backend data.
- `api/schema.py`: OpenAPI schema support.

## Existing Mock Data

- Frontend mock API/catalog data: `api-hub-express/src/data/mock.ts`.
- Backend seed data: `api/seed.py`.

## Existing Environment/Config Files

- Root Docker files: `Dockerfile`, `Dockerfile.backend`, `docker-compose.yml`.
- Frontend config: `api-hub-express/vite.config.ts`, `api-hub-express/eslint.config.js`, `api-hub-express/tailwind.config.ts`, `api-hub-express/tsconfig.json`.
- Backend config: `requirements.txt`, `manage.py`, `IranAPIBackend/settings.py`.

## Validation Run

- `npm run build` in `api-hub-express`: pass.
- Build warning: Browserslist/caniuse-lite data is old.

## Risks

- Git worktree was already dirty before this checkpoint, with large frontend source and static bundle changes. This checkpoint only adds `REPO_MAP.md`.
- README project structure still references older `src/pages`/hooks layout while current app uses `src/routes` and `src/components/site`.
- `api/views.py` appears to contain mixed legacy and newer DRF patterns; inspect carefully before backend checkpoints.
- Development API key field exists on `UserProfile`; future security checkpoint must avoid plaintext key storage.
- Frontend has no explicit typecheck or test script; build currently acts as main frontend validation.

## Next Checkpoint Prompt

```text
Continue from checkpoint 1.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: SHARED TYPES + MOCK/SEED MODEL.
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
