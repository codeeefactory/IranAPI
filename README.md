<div align="center">

# 🚀 IranAPI Hub

<div>
  <strong>🌐 Language / زبان</strong><br>
  <a href="README.md">🇬🇧 English</a> | <a href="README-fa.md">🇮🇷 فارسی</a>
</div>

---

**A modern API marketplace platform with Persian language support**

*Featuring a React frontend and Django REST API backend*

</div>

## ✨ Features

- 📚 **Comprehensive API catalog** - Browse thousands of APIs
- 🌍 **Persian (Farsi) interface** - Full RTL support for Persian users
- 🎨 **Dark/Light theme** - Beautiful UI with theme switching
- 📖 **API documentation** - Complete documentation for each API
- 💰 **Pricing plans** - Flexible pricing for all needs
- 🔐 **User authentication** - Secure token-based authentication
- 📊 **API usage tracking** - Monitor your API consumption
- 🗂️ **Category-based browsing** - Organized by categories
- 🔍 **Search and filtering** - Find APIs quickly

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** + **TypeScript** - Modern UI framework
- ⚡ **Vite** - Lightning-fast build tool
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful component library
- 🧭 **React Router** - Client-side routing
- 🔄 **TanStack Query** - Powerful data synchronization
- 🌐 **Axios** - HTTP client

### Backend
- 🐍 **Django 5.2** - High-level Python web framework
- 🔌 **Django REST Framework** - Powerful API toolkit
- 🌍 **Django CORS Headers** - Cross-origin resource sharing
- 🔑 **Token Authentication** - Secure API access
- 💾 **SQLite** - Lightweight database (development)

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

## 🚀 Quick Start with Docker Compose

<div align="center">

**The easiest way to run this project is using Docker Compose**

*This guide will walk you through the process step by step*

</div>

### 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **🐳 Docker Desktop** (or Docker Engine + Docker Compose)
   - 📥 Download for Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - 🐧 For Linux: Follow your distribution's installation guide
   - ✅ Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

2. **📦 Git** (to clone the repository)
   - 📥 Download: [Git](https://git-scm.com/downloads)
   - ✅ Verify installation:
     ```bash
     git --version
     ```

### 📝 Step-by-Step Setup Guide

#### Step 1️⃣: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and navigate to where you want to store the project:

```bash
git clone https://github.com/codeeefactory/IranAPI.git
cd IranAPI
```

#### Step 2️⃣: Verify Docker is Running

Make sure Docker Desktop is running on your system. You should see the Docker icon in your system tray (Windows/Mac) or verify with:

```bash
docker ps
```

If you see an error, start Docker Desktop and wait for it to fully start.

#### Step 3️⃣: Build and Start the Containers

From the project root directory (where `docker-compose.yml` is located), run:

```bash
docker compose up --build
```

**What this does:**
- `--build` forces Docker to rebuild the images (useful for first-time setup)
- This will download base images, install dependencies, and build both frontend and backend
- The first time may take 5-10 minutes depending on your internet connection

**Expected output:**
- You'll see build progress for both backend and frontend
- Once complete, you'll see logs from both services
- Backend will automatically run database migrations
- Both services will show "ready" messages

#### Step 4️⃣: Access the Application

Once the containers are running, open your web browser and navigate to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin (requires superuser account)

#### Step 5️⃣: Verify Everything is Working

1. **Check Frontend**: Visit http://localhost:5173 - You should see the IranAPI homepage
2. **Check Backend**: Visit http://localhost:8000/api/categories/ - You should see JSON data (or an empty array `[]`)
3. **Check Logs**: In your terminal, you should see logs from both services without errors

### Running in Background (Detached Mode)

To run the containers in the background (so you can use your terminal for other things):

```bash
docker compose up -d
```

To view logs while running in background:
```bash
docker compose logs -f
```

Press `Ctrl+C` to stop viewing logs (containers will keep running).

### Common Operations

#### Stop the Containers

```bash
docker compose down
```

This stops and removes the containers but keeps your data (database, media files).

#### Restart the Containers

```bash
docker compose restart
```

Or stop and start again:
```bash
docker compose down
docker compose up -d
```

#### View Container Status

```bash
docker compose ps
```

This shows which containers are running and their status.

#### View Logs

View all logs:
```bash
docker compose logs
```

View only backend logs:
```bash
docker compose logs backend
```

View only frontend logs:
```bash
docker compose logs frontend
```

Follow logs in real-time:
```bash
docker compose logs -f
```

#### Rebuild After Code Changes

If you've made changes to dependencies or code:

```bash
docker compose up --build
```

Or rebuild specific service:
```bash
docker compose build backend
docker compose build frontend
```

### Creating a Superuser (Admin Account)

To access the Django admin panel, you need to create a superuser:

```bash
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to enter:
- Username
- Email (optional)
- Password (will be hidden as you type)

Then visit http://localhost:8000/admin and log in with these credentials.

### Running Django Management Commands

You can run any Django management command through Docker:

```bash
docker compose exec backend python manage.py <command>
```

Examples:
```bash
# Create migrations
docker compose exec backend python manage.py makemigrations

# Apply migrations
docker compose exec backend python manage.py migrate

# Access Django shell
docker compose exec backend python manage.py shell
```

### Troubleshooting

#### Port Already in Use

If you see an error like "port 8000 is already in use":

1. **Windows/Mac**: Check if another application is using the port
2. **Linux**: Find and stop the process:
   ```bash
   sudo lsof -i :8000
   sudo kill -9 <PID>
   ```
3. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "8001:8000"  # Change 8001 to any available port
   ```

#### Containers Won't Start

1. Check Docker is running: `docker ps`
2. Check logs for errors: `docker compose logs`
3. Try rebuilding: `docker compose up --build --force-recreate`
4. Clean up and start fresh:
   ```bash
   docker compose down -v
   docker compose up --build
   ```

#### Database Issues

If you encounter database errors:

1. Reset the database (⚠️ This will delete all data):
   ```bash
   docker compose down -v
   docker compose up --build
   ```

2. Or manually run migrations:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

#### Frontend Not Connecting to Backend

1. Verify both containers are running: `docker compose ps`
2. Check backend is accessible: Visit http://localhost:8000/api/categories/
3. Check browser console for CORS errors
4. Verify `VITE_API_BASE_URL` in `docker-compose.yml` is set to `http://localhost:8000/api`

### Data Persistence

Your data is persisted in:
- **Database**: `./db.sqlite3` (in project root)
- **Media files**: `./media/` (in project root)

These are mounted as volumes, so your data persists even when containers are stopped.

### Stopping and Cleaning Up

**Stop containers (keeps data):**
```bash
docker compose down
```

**Stop and remove volumes (⚠️ deletes database and media):**
```bash
docker compose down -v
```

**Remove everything including images:**
```bash
docker compose down -v --rmi all
```


### Manual Setup (Without Docker)

If you prefer to run the project without Docker, follow these instructions:

#### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

#### Backend Setup

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
   
   The frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/me/` - Get current user

### 🗂️ Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/{id}/` - Get category details
- `GET /api/categories/{id}/apis/` - Get APIs in category

### 🔌 APIs
- `GET /api/apis/` - List all APIs (with filtering)
- `GET /api/apis/{id}/` - Get API details
- `GET /api/apis/{id}/similar/` - Get similar APIs
- `POST /api/apis/{id}/rate/` - Rate an API

### 💰 Pricing Plans
- `GET /api/pricing-plans/` - List pricing plans
- `GET /api/pricing-plans/?api={id}` - Get plans for specific API

### 📖 Documentation
- `GET /api/documentations/` - List documentation
- `GET /api/documentations/?api={id}` - Get docs for specific API

### 👤 User Profile
- `GET /api/profiles/me/` - Get user profile
- `PATCH /api/profiles/me/` - Update user profile

### 📊 Usage
- `GET /api/usage/` - Get API usage history
- `GET /api/usage/stats/` - Get usage statistics

## 💻 Development

### Backend Development

- 🔄 Run migrations: `python manage.py makemigrations && python manage.py migrate`
- 👤 Create superuser: `python manage.py createsuperuser`
- 🚀 Run server: `python manage.py runserver`
- 🔧 Access admin: `http://localhost:8000/admin/`

### Frontend Development

- ⚡ Dev server: `npm run dev`
- 📦 Build: `npm run build`
- 👀 Preview: `npm run preview`
- 🔍 Lint: `npm run lint`

## 🗄️ Database Models

- **📁 Category**: API categories (AI, Payment, Communication, etc.)
- **🔌 API**: Main API model with details, ratings, and status
- **💰 PricingPlan**: Pricing tiers for APIs
- **📖 Documentation**: API documentation content
- **👤 UserProfile**: Extended user profile information
- **📊 APIUsage**: Track API usage per user

## 🔐 Authentication

The API uses **Token Authentication**. After login/registration, the token is stored in `localStorage` and automatically included in API requests.

## 🌍 CORS Configuration

CORS is configured to allow requests from:
- 🌐 `http://localhost:8080` (Vite dev server)
- 🌐 `http://localhost:5173` (Alternative Vite port)
- 🌐 `http://127.0.0.1:8080`
- 🌐 `http://127.0.0.1:5173`

## 📝 Adding Sample Data

You can add sample data through:
1. 🎛️ Django admin panel (`/admin/`)
2. 🐍 Django shell: `python manage.py shell`
3. ⚙️ Management commands (create custom commands)

---

<div align="center">

## 📄 License

**MIT License**

Made with ❤️ by the IranAPI Team

</div>
