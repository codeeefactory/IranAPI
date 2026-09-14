<div dir="rtl" align="center">

# 🚀 ایران‌ای‌پی‌آی هاب

<div>
  <strong>🌐 زبان / Language</strong><br>
  <a href="README-fa.md">🇮🇷 فارسی</a> | <a href="README.md">🇬🇧 English</a>
</div>

---

**یک پلتفرم مدرن بازار API با پشتیبانی از زبان فارسی**

*شامل فرانت‌اند React و بک‌اند Django REST API*

</div>

<div dir="rtl">

## ✨ ویژگی‌ها

- 📚 **کاتالوگ جامع API** - مرور هزاران API
- 🌍 **رابط فارسی** - پشتیبانی کامل RTL برای کاربران فارسی‌زبان
- 🎨 **تم تاریک/روشن** - رابط کاربری زیبا با امکان تغییر تم
- 📖 **مستندات API** - مستندات کامل برای هر API
- 💰 **پلن‌های قیمت‌گذاری** - قیمت‌گذاری انعطاف‌پذیر برای همه نیازها
- 🔐 **احراز هویت کاربر** - احراز هویت امن مبتنی بر Token
- 📊 **ردیابی استفاده از API** - نظارت بر مصرف API شما
- 🗂️ **مرور بر اساس دسته‌بندی** - سازمان‌دهی شده بر اساس دسته‌بندی‌ها
- 🔍 **جستجو و فیلتر** - پیدا کردن سریع APIها

## 🛠️ پشته فناوری

### فرانت‌اند
- ⚛️ **React 18** + **TypeScript** - فریمورک UI مدرن
- ⚡ **Vite** - ابزار build فوق‌العاده سریع
- 🎨 **Tailwind CSS** - فریمورک CSS مبتنی بر utility
- 🧩 **shadcn/ui** - کتابخانه کامپوننت زیبا
- 🧭 **React Router** - مسیریابی سمت کلاینت
- 🔄 **TanStack Query** - همگام‌سازی داده قدرتمند
- 🌐 **Axios** - کلاینت HTTP

### بک‌اند
- 🐍 **Django 6.0** - فریمورک وب Python سطح بالا
- 🔌 **Django REST Framework** - ابزار قدرتمند API
- 🌍 **Django CORS Headers** - اشتراک‌گذاری منابع cross-origin
- 🔑 **احراز هویت Token** - دسترسی امن به API
- 💾 **MongoDB 8.0** - تنها دیتابیس زمان اجرا، با backend رسمی Django و PyMongo

## ساختار پروژه

```
IranAPI/
├── api-hub-express/          # اپلیکیشن React فرانت‌اند
│   ├── src/
│   │   ├── components/       # کامپوننت‌های قابل استفاده مجدد
│   │   ├── pages/            # صفحات Route
│   │   ├── hooks/            # هوک‌های سفارشی (شامل هوک‌های API)
│   │   └── lib/              # ابزارها و سرویس API
│   └── public/               # فایل‌های استاتیک
├── IranAPIBackend/           # تنظیمات پروژه Django
├── api/                      # اپلیکیشن Django API
│   ├── models.py            # مدل‌های دیتابیس
│   ├── serializers.py       # سریالایزرهای DRF
│   ├── views.py             # Viewset‌های API
│   └── admin.py             # پیکربندی Django admin
├── manage.py                 # اسکریپت مدیریت Django
├── requirements.txt          # وابستگی‌های Python
└── mongo_migrations/        # migrationهای سازگار با MongoDB برای Admin/Auth
```

## 🚀 راه‌اندازی سریع با Docker Compose

<div dir="rtl" align="center">

**ساده‌ترین راه برای اجرای این پروژه استفاده از Docker Compose است**

*این راهنما شما را گام به گام در فرآیند راه‌اندازی راهنمایی می‌کند*

</div>

### 📋 پیش‌نیازها

قبل از شروع، مطمئن شوید که موارد زیر روی سیستم شما نصب شده است:

1. **🐳 Docker Desktop** (یا Docker Engine + Docker Compose)
   - 📥 دانلود برای Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - 🐧 برای Linux: راهنمای نصب توزیع خود را دنبال کنید
   - ✅ تأیید نصب:
     ```bash
     docker --version
     docker compose version
     ```

2. **📦 Git** (برای کلون کردن repository)
   - 📥 دانلود: [Git](https://git-scm.com/downloads)
   - ✅ تأیید نصب:
     ```bash
     git --version
     ```

### 📝 راهنمای نصب گام به گام

#### مرحله 1️⃣: کلون کردن Repository

ترمینال خود را باز کنید (Command Prompt در Windows، Terminal در Mac/Linux) و به جایی که می‌خواهید پروژه را ذخیره کنید بروید:

```bash
git clone https://github.com/codeeefactory/IranAPI.git
cd IranAPI
```

#### مرحله 2️⃣: تأیید اجرای Docker

مطمئن شوید Docker Desktop روی سیستم شما در حال اجرا است. باید آیکون Docker را در system tray خود ببینید (Windows/Mac) یا با دستور زیر تأیید کنید:

```bash
docker ps
```

اگر خطایی دیدید، Docker Desktop را راه‌اندازی کنید و صبر کنید تا به طور کامل شروع شود.

#### مرحله 3️⃣: Build و Start کردن Containers

از دایرکتوری ریشه پروژه (جایی که `docker-compose.yml` قرار دارد)، دستور زیر را اجرا کنید:

```bash
docker compose up --build
```

**این دستور چه می‌کند:**
- `--build` Docker را مجبور می‌کند تصاویر را دوباره بسازد (برای راه‌اندازی اولیه مفید است)
- این کار تصاویر پایه را دانلود می‌کند، وابستگی‌ها را نصب می‌کند و هم فرانت‌اند و هم بک‌اند را می‌سازد
- اولین بار ممکن است بسته به سرعت اینترنت شما 5-10 دقیقه طول بکشد

**خروجی مورد انتظار:**
- پیشرفت build برای هر دو بک‌اند و فرانت‌اند را خواهید دید
- پس از تکمیل، لاگ‌های هر دو سرویس را خواهید دید
- بک‌اند به طور خودکار migrations دیتابیس را اجرا می‌کند
- هر دو سرویس پیام "ready" را نمایش می‌دهند

#### مرحله 4️⃣: دسترسی به Application

پس از اجرای containers، مرورگر وب خود را باز کنید و به آدرس‌های زیر بروید:

- **فرانت‌اند**: http://localhost:5173
- **بک‌اند API**: http://localhost:8000/api
- **پنل ادمین**: http://localhost:8000/admin (نیاز به حساب superuser دارد)

#### مرحله 5️⃣: تأیید عملکرد همه چیز

1. **بررسی فرانت‌اند**: به http://localhost:5173 بروید - باید صفحه اصلی IranAPI را ببینید
2. **بررسی بک‌اند**: به http://localhost:8000/api/categories/ بروید - باید داده JSON ببینید (یا آرایه خالی `[]`)
3. **بررسی لاگ‌ها**: در ترمینال خود، باید لاگ‌های هر دو سرویس را بدون خطا ببینید

### اجرا در پس‌زمینه (حالت Detached)

برای اجرای containers در پس‌زمینه (تا بتوانید از ترمینال خود برای کارهای دیگر استفاده کنید):

```bash
docker compose up -d
```

برای مشاهده لاگ‌ها در حین اجرا در پس‌زمینه:
```bash
docker compose logs -f
```

برای توقف مشاهده لاگ‌ها `Ctrl+C` را فشار دهید (containers به اجرا ادامه می‌دهند).

### عملیات رایج

#### توقف Containers

```bash
docker compose down
```

این دستور containers را متوقف کرده و حذف می‌کند اما داده‌های شما را نگه می‌دارد (دیتابیس، فایل‌های media).

#### راه‌اندازی مجدد Containers

```bash
docker compose restart
```

یا متوقف و دوباره شروع کنید:
```bash
docker compose down
docker compose up -d
```

#### مشاهده وضعیت Container

```bash
docker compose ps
```

این دستور نشان می‌دهد کدام containers در حال اجرا هستند و وضعیت آن‌ها.

#### مشاهده لاگ‌ها

مشاهده همه لاگ‌ها:
```bash
docker compose logs
```

فقط لاگ‌های بک‌اند:
```bash
docker compose logs backend
```

فقط لاگ‌های فرانت‌اند:
```bash
docker compose logs frontend
```

دنبال کردن لاگ‌ها به صورت real-time:
```bash
docker compose logs -f
```

#### Rebuild بعد از تغییرات کد

اگر تغییراتی در وابستگی‌ها یا کد ایجاد کرده‌اید:

```bash
docker compose up --build
```

یا rebuild سرویس خاص:
```bash
docker compose build backend
docker compose build frontend
```

### ایجاد Superuser (حساب ادمین)

برای دسترسی به پنل ادمین Django، باید یک superuser ایجاد کنید:

```bash
docker compose exec backend python manage.py createsuperuser
```

دستورالعمل‌ها را دنبال کنید تا وارد کنید:
- نام کاربری
- ایمیل (اختیاری)
- رمز عبور (در حین تایپ پنهان می‌شود)

سپس به http://localhost:8000/admin بروید و با این اطلاعات وارد شوید.

### اجرای دستورات مدیریت Django

می‌توانید هر دستور مدیریت Django را از طریق Docker اجرا کنید:

```bash
docker compose exec backend python manage.py <command>
```

مثال‌ها:
```bash
# ایجاد migrations
docker compose exec backend python manage.py makemigrations

# اعمال migrations
docker compose exec backend python manage.py migrate

# دسترسی به Django shell
docker compose exec backend python manage.py shell
```

### عیب‌یابی

#### پورت در حال استفاده است

اگر خطایی مانند "port 8000 is already in use" دیدید:

1. **Windows/Mac**: بررسی کنید که آیا برنامه دیگری از پورت استفاده می‌کند
2. **Linux**: فرآیند را پیدا کرده و متوقف کنید:
   ```bash
   sudo lsof -i :8000
   sudo kill -9 <PID>
   ```
3. یا پورت را در `docker-compose.yml` تغییر دهید:
   ```yaml
   ports:
     - "8001:8000"  # 8001 را به هر پورت در دسترس تغییر دهید
   ```

#### Containers راه‌اندازی نمی‌شوند

1. بررسی کنید Docker در حال اجرا است: `docker ps`
2. لاگ‌ها را برای خطا بررسی کنید: `docker compose logs`
3. سعی کنید rebuild کنید: `docker compose up --build --force-recreate`
4. پاک‌سازی و شروع تازه:
   ```bash
   docker compose down -v
   docker compose up --build
   ```

#### مشکلات دیتابیس

اگر خطاهای دیتابیس مواجه شدید:

1. Reset کردن دیتابیس (⚠️ این کار تمام داده‌ها را حذف می‌کند):
   ```bash
   docker compose down -v
   docker compose up --build
   ```

2. یا به صورت دستی migrations را اجرا کنید:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

#### فرانت‌اند به بک‌اند متصل نمی‌شود

1. بررسی کنید هر دو container در حال اجرا هستند: `docker compose ps`
2. بررسی کنید بک‌اند قابل دسترسی است: به http://localhost:8000/api/categories/ بروید
3. کنسول مرورگر را برای خطاهای CORS بررسی کنید
4. بررسی کنید `VITE_API_BASE_URL` روی `/api/v1` و `VITE_DEV_PROXY_TARGET` روی `http://backend:8000` تنظیم شده باشد

### پایداری داده

داده‌های شما در موارد زیر ذخیره می‌شوند:
- **دیتابیس**: volume نام‌دار `iranapi_mongodb_data`
- **فایل‌های media**: `./media/` (در ریشه پروژه)

این‌ها به عنوان volume mount شده‌اند، بنابراین داده‌های شما حتی زمانی که containers متوقف می‌شوند نیز باقی می‌مانند.

### توقف و پاک‌سازی

**توقف containers (داده‌ها را نگه می‌دارد):**
```bash
docker compose down
```

**توقف و حذف volumes (⚠️ دیتابیس و media را حذف می‌کند):**
```bash
docker compose down -v
```

**حذف همه چیز شامل تصاویر:**
```bash
docker compose down -v --rmi all
```

## راه‌اندازی دستی (بدون Docker)

اگر ترجیح می‌دهید پروژه را بدون Docker اجرا کنید، این دستورالعمل‌ها را دنبال کنید:

#### پیش‌نیازها

- Python 3.12+
- Node.js 18+
- npm یا yarn

#### راه‌اندازی بک‌اند

1. **فعال‌سازی محیط مجازی** (در صورت استفاده):
   ```bash
   source bin/activate  # در Linux/Mac
   # یا
   .\bin\activate  # در Windows
   ```

2. **نصب وابستگی‌های Python**:
   ```bash
   pip install -r requirements.txt
   ```

3. **اجرای migrations**:
   ```bash
   python manage.py migrate
   ```

4. **ایجاد superuser** (اختیاری، برای دسترسی ادمین):
   ```bash
   python manage.py createsuperuser
   ```

5. **شروع سرور توسعه Django**:
   ```bash
   python manage.py runserver
   ```
   
   بک‌اند در `http://localhost:8000` در دسترس خواهد بود
   - API endpoints: `http://localhost:8000/api/`
   - پنل ادمین: `http://localhost:8000/admin/`

#### راه‌اندازی فرانت‌اند

1. **رفتن به دایرکتوری فرانت‌اند**:
   ```bash
   cd api-hub-express
   ```

2. **نصب وابستگی‌ها**:
   ```bash
   npm install
   ```

3. **ایجاد فایل محیط** (اختیاری):
   ```bash
   cp .env.example .env
   ```
   
   `.env` را ویرایش کنید و تنظیم کنید:
   ```
   VITE_API_BASE_URL=/api/v1
   VITE_DEV_PROXY_TARGET=http://127.0.0.1:8000
   ```

4. **شروع سرور توسعه**:
   ```bash
   npm run dev
   ```
   
   فرانت‌اند در `http://localhost:5173` در دسترس خواهد بود

## 📡 API Endpoints

### 🔐 احراز هویت
- `POST /api/v1/auth/register/` - ثبت‌نام و ایجاد نشست
- `POST /api/v1/auth/login/` - ورود و ایجاد نشست
- `POST /api/v1/auth/logout/` - خروج و حذف نشست
- `GET /api/v1/auth/session/` - وضعیت نشست فعلی

### 🗂️ دسته‌بندی‌ها
- `GET /api/v1/catalog/categories/` - لیست دسته‌بندی‌ها
- `GET /api/v1/catalog/categories/{slug}/` - جزئیات دسته‌بندی
- `GET /api/v1/catalog/categories/{slug}/apis/` - APIهای دسته‌بندی

### 🔌 APIها
- `GET /api/v1/catalog/apis/` - فهرست و جستجوی APIها
- `GET /api/v1/catalog/apis/{slug}/` - جزئیات API
- `GET /api/v1/catalog/apis/{slug}/similar/` - APIهای مشابه
- `POST /api/v1/catalog/apis/{slug}/ratings/` - ثبت یا تغییر امتیاز

### 💰 پلن‌های قیمت‌گذاری
- `GET /api/v1/catalog/pricing-plans/` - فهرست پلن‌های API
- `GET /api/v1/catalog/subscription-plans/` - فهرست پلن‌های اشتراک

### 📖 مستندات
- `GET /api/v1/catalog/documentations/` - فهرست و جستجوی مستندات
- `GET /api/v1/catalog/apis/{slug}/docs/` - مستندات یک API

### 👤 پروفایل کاربر
- `GET /api/v1/account/profile/` - دریافت پروفایل کاربر
- `PATCH /api/v1/account/profile/` - به‌روزرسانی پروفایل کاربر
- `POST /api/v1/account/api-key/rotate/` - چرخش کلید Bearer

### 📊 استفاده
- `GET /api/v1/account/usage/` - دریافت تاریخچه استفاده از API
- `GET /api/v1/account/usage/stats/` - دریافت آمار استفاده

## 💻 توسعه

### توسعه بک‌اند

- 🔄 اجرای migrations: `python manage.py makemigrations && python manage.py migrate`
- 👤 ایجاد superuser: `python manage.py createsuperuser`
- 🚀 اجرای سرور: `python manage.py runserver`
- 🔧 دسترسی به ادمین: `http://localhost:8000/admin/`

### توسعه فرانت‌اند

- ⚡ سرور توسعه: `npm run dev`
- 📦 Build: `npm run build`
- 👀 Preview: `npm run preview`
- 🔍 Lint: `npm run lint`

## 🗄️ مدل‌های دیتابیس

- مجموعه‌های عملیاتی MongoDB شامل دسته‌بندی‌ها، APIها، endpointها، پلن‌ها، مستندات و امتیازها هستند.
- حساب و پروفایل کاربر در سند `users` نگهداری می‌شود؛ نشست‌ها، اشتراک‌ها، پروژه‌ها و مصرف نیز مجموعه‌های پایدار جدا دارند.
- کاربران، مجوزها و نشست‌های داخلی Django Admin هم با بک‌اند رسمی MongoDB در همان پایگاه ذخیره می‌شوند.

## 🔐 احراز هویت

رابط وب از نشست `HttpOnly` مبتنی بر MongoDB استفاده می‌کند. برای فراخوانی ماشینی می‌توان کلید یک‌بارنمایش‌داده‌شده `iapi_...` را با هدر `Authorization: Bearer` فرستاد؛ کلید خام در `localStorage` یا MongoDB ذخیره نمی‌شود.

ورود با Google/GitHub به‌صورت پیش‌فرض خاموش است. برای فعال‌سازی، URL کامل شروع OAuth را فقط در محیط backend قرار دهید (`IRANAPI_GITHUB_AUTH_URL` یا `IRANAPI_GOOGLE_AUTH_URL`) و سرویس را rebuild کنید؛ مقدار خالی عمداً پیام «provider پیکربندی نشده» نشان می‌دهد.

## 🌍 پیکربندی CORS

CORS برای اجازه درخواست از موارد زیر پیکربندی شده است:
- 🌐 `http://localhost:8080` (سرور توسعه Vite)
- 🌐 `http://localhost:5173` (پورت جایگزین Vite)
- 🌐 `http://127.0.0.1:8080`
- 🌐 `http://127.0.0.1:5173`

## 📝 افزودن داده نمونه

کاتالوگ واقعی سرویس‌دهندگان ایرانی را با دستور زیر وارد یا به‌روزرسانی کنید:

```bash
python manage.py seed_persian_apis
```

پس از آن داده‌ها از کنسول زنده MongoDB در پنل ادمین (`/admin/`) قابل مشاهده و ویرایش‌اند.

---

<div dir="rtl" align="center">

## 📄 مجوز

**مجوز MIT**

ساخته شده با ❤️ توسط تیم ایران‌ای‌پی‌آی

</div>

</div>

