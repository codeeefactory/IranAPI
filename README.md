# IranAPI Hub

A modern API marketplace platform with Persian language support, featuring a React frontend and Django REST API backend.

## Features

- Comprehensive API catalog
- Persian (Farsi) interface with RTL support
- Dark/Light theme
- API documentation
- Pricing plans
- User authentication
- API usage tracking
- Category-based browsing
- Search and filtering

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- TanStack Query
- Axios

### Backend
- Django 5.2
- Django REST Framework
- Django CORS Headers
- Token Authentication
- SQLite (development)

## Project Structure

```
IranAPI/
├── api-hub-express/          # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom hooks (including API hooks)
│   │   └── lib/              # Utilities and API service
│   └── public/               # Static assets
├── IranAPIBackend/           # Django project settings
├── api/                      # Django API app
│   ├── models.py            # Database models
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API viewsets
│   └── admin.py             # Django admin configuration
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
└── db.sqlite3               # SQLite database (created after migrations)
```

## Setup Instructions

### Docker Setup

You can run both the Django API and the React frontend with Docker:

1. Build and start the stack:
   ```bash
   docker compose up --build
   ```
2. The backend is served at `http://localhost:8000` and automatically runs migrations on startup.
3. The frontend is served at `http://localhost:5173` and talks to the backend through the internal `backend` service using `VITE_API_BASE_URL`.

Useful helper commands:

- Run Django management commands:
  ```bash
  docker compose run --rm backend python manage.py createsuperuser
  ```
- Stop the stack:
  ```bash
  docker compose down
  ```
- Rebuild after dependency changes:
  ```bash
  docker compose build backend frontend
  ```


### Prerequisites

- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Activate virtual environment** (if using one):
   ```bash
   source bin/activate  # On Linux/Mac
   # or
   .\bin\activate  # On Windows
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Create superuser** (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Django development server**:
   ```bash
   python manage.py runserver
   ```
   
   The backend will be available at `http://localhost:8000`
   - API endpoints: `http://localhost:8000/api/`
   - Admin panel: `http://localhost:8000/admin/`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd api-hub-express
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (optional):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/me/` - Get current user

### Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/{id}/` - Get category details
- `GET /api/categories/{id}/apis/` - Get APIs in category

### APIs
- `GET /api/apis/` - List all APIs (with filtering)
- `GET /api/apis/{id}/` - Get API details
- `GET /api/apis/{id}/similar/` - Get similar APIs
- `POST /api/apis/{id}/rate/` - Rate an API

### Pricing Plans
- `GET /api/pricing-plans/` - List pricing plans
- `GET /api/pricing-plans/?api={id}` - Get plans for specific API

### Documentation
- `GET /api/documentations/` - List documentation
- `GET /api/documentations/?api={id}` - Get docs for specific API

### User Profile
- `GET /api/profiles/me/` - Get user profile
- `PATCH /api/profiles/me/` - Update user profile

### Usage
- `GET /api/usage/` - Get API usage history
- `GET /api/usage/stats/` - Get usage statistics

## Development

### Backend Development

- Run migrations: `python manage.py makemigrations && python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Run server: `python manage.py runserver`
- Access admin: `http://localhost:8000/admin/`

### Frontend Development

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

## Database Models

- **Category**: API categories (AI, Payment, Communication, etc.)
- **API**: Main API model with details, ratings, and status
- **PricingPlan**: Pricing tiers for APIs
- **Documentation**: API documentation content
- **UserProfile**: Extended user profile information
- **APIUsage**: Track API usage per user

## Authentication

The API uses Token Authentication. After login/registration, the token is stored in localStorage and automatically included in API requests.

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:8080` (Vite dev server)
- `http://localhost:5173` (Alternative Vite port)
- `http://127.0.0.1:8080`
- `http://127.0.0.1:5173`

## Adding Sample Data

You can add sample data through:
1. Django admin panel (`/admin/`)
2. Django shell: `python manage.py shell`
3. Management commands (create custom commands)

## License

MIT
