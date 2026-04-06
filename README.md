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

- `GET /api/v1/account/user/`
- `PATCH /api/v1/account/user/`
- `GET /api/v1/account/profile/`
- `PATCH /api/v1/account/profile/`
- `GET /api/v1/account/access/`
- `GET /api/v1/account/subscription/`
- `POST /api/v1/account/subscription/`
- `POST /api/v1/account/subscription/checkout/{checkout_id}/confirm/`
- `GET /api/v1/account/usage/`
- `GET /api/v1/account/usage/stats/`

1. **🐳 Docker Desktop** (or Docker Engine + Docker Compose)
   - 📥 Download for Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - 🐧 For Linux: Follow your distribution's installation guide
   - ✅ Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

- `GET /api/v1/catalog/categories/`
- `GET /api/v1/catalog/categories/{slug}/`
- `GET /api/v1/catalog/categories/{slug}/apis/`
- `GET /api/v1/catalog/apis/`
- `POST /api/v1/catalog/apis/`
- `GET /api/v1/catalog/apis/{slug}/`
- `GET /api/v1/catalog/apis/{slug}/similar/`
- `POST /api/v1/catalog/apis/{slug}/ratings/`
- `GET /api/v1/catalog/apis/{slug}/plans/`
- `GET /api/v1/catalog/apis/{slug}/docs/`
- `GET /api/v1/catalog/apis/{slug}/endpoints/`
- `GET /api/v1/catalog/pricing-plans/`
- `GET /api/v1/catalog/subscription-plans/`
- `GET /api/v1/catalog/documentations/`

### 📝 Step-by-Step Setup Guide

#### Step 1️⃣: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and navigate to where you want to store the project:

- Portal auth uses Mongo-backed sessions stored in a dedicated collection.
- User subscription plans are managed in IranAPI through `/catalog/subscription-plans/` and `/account/subscription/`.
- Authenticated developers can publish APIs directly through `/catalog/apis/`; released APIs are active and visible in Browse/Explore.
- API details expose RapidAPI-style endpoint references, sample payloads, code snippets, and browser test console output.
- Legacy token responses still exist on compatibility auth routes.
- Local API key generation is disabled by default.
- Public API access and account subscriptions should be treated as IranAPI-managed unless a legacy importer maps old external metadata.
- Docker verification still has to be run on a machine with Docker installed.
