import { useEffect, useRef } from "react";

import { useI18n, type Locale } from "@/lib/i18n";

const exactText: Record<string, string> = {
  "پلتفرم IranAPI • تجربه بازار API با الهام از RapidAPI": "IranAPI platform • API marketplace experience inspired by RapidAPI",
  "دنیای بی‌پایان": "Endless world",
  "APIهای آماده": "Ready APIs",
  "یکپارچه‌سازی سریع، مستندات روشن و اتصال قابل پیگیری به سرویس‌های مورد نیاز محصول شما.": "Fast integration, clear docs, and traceable access to the services your product needs.",
  "دقایقی تا راه‌اندازی فاصله دارید.": "Minutes away from launch.",
  "جستجو": "Search",
  "زنده": "Live",
  "کاتالوگ IranAPI": "IranAPI catalog",
  "تیمی": "Team-ready",
  "داشبورد مشترک": "Shared dashboard",
  "API فعال": "Active APIs",
  "کاربر فعال": "Active users",
  "آپتایم": "Uptime",
  "خطایی رخ داد": "Something went wrong",
  "یک خطای غیرمنتظره رخ داد": "An unexpected error occurred",
  "بارگذاری مجدد": "Reload",
  "بهترین امتیاز": "Best rated",
  "پربازدیدترین": "Most viewed",
  "تازه‌ترین": "Newest",
  "نام": "Name",
  "بدون دسته": "Uncategorized",
  "کشف APIها": "API Hub",
  "ویژه": "Featured",
  "محبوب": "Popular",
  "توضیح کوتاه این API هنوز ثبت نشده است.": "No short description has been added for this API yet.",
  "امتیاز": "Rating",
  "شروع قیمت": "Starting price",
  "جزئیات API": "API details",
  "کشف و انتخاب": "Discover and choose",
  "APIها را با فیلترهای دقیق و نتیجه‌های قابل مقایسه پیدا کنید": "Find APIs with precise filters and comparable results",
  "نتیجه‌ها بر اساس دسته‌بندی، جست‌وجو و مرتب‌سازی به‌روز نمایش داده می‌شوند تا انتخاب سرویس برای تیم‌های فنی سریع‌تر و مطمئن‌تر شود.": "Results update by category, search, and sorting so technical teams can choose faster and with more confidence.",
  "جست‌وجوی نام یا کاربرد API": "Search API name or use case",
  "نمایش بر اساس": "Sort by",
  "نمایش نتایج": "Show results",
  "حذف فیلترها": "Clear filters",
  "همه دسته‌ها": "All categories",
  "برای شروع": "Start here",
  "APIهای پیشنهادی برای بررسی سریع": "Recommended APIs for quick review",
  "نتایج": "Results",
  "در حال بارگذاری نتایج": "Loading results",
  "بارگذاری فهرست APIها انجام نشد. دوباره تلاش کنید.": "Could not load API list. Try again.",
  "دیدن همه": "View all",
  "قبلی": "Previous",
  "بعدی": "Next",
  "نتیجه‌ای پیدا نشد": "No results found",
  "فیلترها را ساده‌تر کنید یا با عبارت دیگری جست‌وجو کنید.": "Simplify filters or search with another term.",
  "هاب API برای تیم‌های ایرانی": "API hub for Iranian teams",
  "هاب API برای تیم‌های محصول، داده و توسعه": "API hub for product, data, and engineering teams",
  "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید": "Find the right API fast, compare confidently, connect smoothly",
  "IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.": "IranAPI brings services, docs, pricing, and access status together so your team can choose and manage the right API without scattered searching.",
  "مطالعه مستندات": "Read docs",
  "داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری": "Unified data, clear docs, traceable access",
  "ساخته‌شده برای تصمیم‌های روزمره تیم فنی": "Built for daily engineering decisions",
  "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده": "From service selection to access management, everything in one simple flow",
  "جست‌وجوی سریع و قابل اعتماد": "Fast, reliable search",
  "سرویس‌ها با دسته‌بندی، جست‌وجو و مرتب‌سازی روشن نمایش داده می‌شوند تا گزینه مناسب زودتر پیدا شود.": "Services appear with clear categories, search, and sorting so the right option is found sooner.",
  "مستندات و قیمت‌گذاری کنار هم": "Docs and pricing together",
  "جزئیات فنی، پلن‌ها و وضعیت آماده‌بودن هر API در یک صفحه دیده می‌شود تا مقایسه کوتاه‌تر شود.": "Technical details, plans, and API readiness appear on one page for faster comparison.",
  "داشبورد آماده برای عملیات": "Operations-ready dashboard",
  "دسترسی‌ها، اشتراک‌ها و مصرف سرویس‌ها در یک کنسول قابل پیگیری می‌ماند.": "Access, subscriptions, and usage stay traceable in one console.",
  "APIهای قابل بررسی": "Browsable APIs",
  "دسته‌بندی‌ها": "Categories",
  "الگوی دسترسی": "Access model",
  "دسته‌های پرکاربرد": "Popular categories",
  "از حوزه‌ای شروع کنید که به محصول شما نزدیک‌تر است": "Start from the domain closest to your product",
  "دسته‌ها برای اسکن سریع بازار API چیده شده‌اند؛ از پرداخت و داده تا ارتباطات و هوش مصنوعی.": "Categories are arranged for quick API market scanning, from payments and data to messaging and AI.",
  "سرویس": "services",
  "دیدن APIهای این دسته": "View APIs in this category",
  "پیشنهادهای شروع": "Starter picks",
  "APIهایی که ارزش بررسی سریع دارند": "APIs worth a quick review",
  "دیدن همه APIها": "View all APIs",
  "مشاهده جزئیات و مستندات": "View details and docs",
  "تصمیم‌گیری سریع‌تر": "Faster decisions",
  "از جست‌وجوی اولیه تا انتخاب پلن و خواندن مستندات، مسیرها کوتاه و قابل پیش‌بینی هستند.": "From initial search to plan selection and docs, paths are short and predictable.",
  "اطلاعات قابل اتکا": "Reliable information",
  "متادیتای سرویس، روش احراز هویت و وضعیت انتشار با ساختاری یکدست نمایش داده می‌شود.": "Service metadata, auth method, and release status are shown in a consistent structure.",
  "پیشنهادهای مرتبط‌تر": "More relevant suggestions",
  "APIهای برجسته، دسته‌های نزدیک و سرویس‌های مشابه کمک می‌کنند انتخاب بعدی واضح‌تر باشد.": "Featured APIs, nearby categories, and similar services make the next choice clearer.",
  "صفحه یافت نشد": "Page not found",
  "صفحه مورد نظر پیدا نشد": "Requested page not found",
  "مسیر واردشده وجود ندارد یا به آدرس دیگری منتقل شده است. از صفحه اصلی یا فهرست APIها ادامه دهید.": "The entered route does not exist or has moved. Continue from the home page or API directory.",
  "خانه": "Home",
  "قیمت‌گذاری": "Pricing",
  "پلن‌ها و ظرفیت‌ها": "Plans and capacity",
  "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید": "Compare price, usage limits, and service status in one place",
  "این صفحه اشتراک‌های حساب کاربری و پلن‌های هر API را از بک‌اند نمایش می‌دهد تا هزینه، ظرفیت و آمادگی سرویس‌ها شفاف باشد.": "This page shows account subscriptions and API plans from the backend so cost, capacity, and readiness are transparent.",
  "پلن‌های فعال": "Active plans",
  "APIهای دارای پلن": "APIs with plans",
  "پلن‌های محبوب": "Popular plans",
  "اشتراک توسعه‌دهنده": "Developer subscription",
  "پلن‌های عضویت IranAPI": "IranAPI membership plans",
  "این پلن‌ها ظرفیت انتشار API، سقف مصرف ماهانه و امکانات داشبورد را برای حساب توسعه‌دهنده مشخص می‌کنند.": "These plans define API publishing capacity, monthly usage, and dashboard features for developer accounts.",
  "نامحدود": "Unlimited",
  "انتخاب این اشتراک": "Choose this subscription",
  "هنوز پلن اشتراکی فعالی ثبت نشده است.": "No active subscription plan has been added yet.",
  "نوع پلن": "Plan type",
  "درخواست روزانه": "Daily requests",
  "درخواست ماهانه": "Monthly requests",
  "نامشخص": "Unknown",
  "وضعیت دسترسی": "Access status",
  "آماده فعال‌سازی": "Ready to activate",
  "در حال آماده‌سازی": "Preparing",
  "شروع فعال‌سازی": "Start activation",
  "مشاهده وضعیت": "View status",
  "هنوز پلنی برای نمایش وجود ندارد": "No plans to show yet",
  "بعد از ثبت پلن‌های قیمت‌گذاری در بک‌اند، این بخش به‌صورت خودکار به‌روز می‌شود.": "After pricing plans are added in the backend, this section updates automatically.",
  "ورود": "Sign in",
  "ورود امن": "Secure sign in",
  "حساب توسعه‌دهنده": "Developer account",
  "ورود به حساب IranAPI": "Sign in to IranAPI",
  "از این حساب برای مدیریت پروفایل، دسترسی‌های ثبت‌شده، کلیدهای امن و تاریخچه مصرف استفاده می‌کنید.": "Use this account to manage profile, registered access, secure keys, and usage history.",
  "برای ادامه، ابتدا وارد حساب خود شوید. بعد از ورود به صفحه قبلی برمی‌گردید.": "Sign in first to continue. After sign-in, you return to the previous page.",
  "نشست محافظت‌شده": "Protected session",
  "نام کاربری": "Username",
  "رمز عبور": "Password",
  "در حال ورود...": "Signing in...",
  "ورود به داشبورد": "Enter dashboard",
  "حساب ندارید؟": "No account?",
  "ساخت حساب": "Create account",
  "داشبورد آماده مدیریت": "Management-ready dashboard",
  "پس از ورود می‌توانید پروفایل، مصرف، دسترسی‌های فعال و اشتراک‌ها را در یک نگاه بررسی کنید.": "After signing in, review profile, usage, active access, and subscriptions at a glance.",
  "نشست امن": "Secure session",
  "ورود با نشست محافظت‌شده انجام می‌شود و رابط فقط داده‌های موردنیاز حساب شما را دریافت می‌کند.": "Sign-in uses a protected session and the UI only receives required account data.",
  "نقش‌ها و دسترسی‌های روشن": "Clear roles and access",
  "حساب پرتال از دسترسی مصرفی APIها جداست و هر دسترسی از داشبورد قابل پیگیری است.": "Portal account is separate from API consumption access, and every access is trackable from the dashboard.",
  "حساب نمونه برای QA": "Sample QA account",
  "پر کردن حساب نمونه": "Fill sample account",
  "ثبت‌نام": "Sign up",
  "ثبت‌نام توسعه‌دهنده": "Developer sign up",
  "ساخت حساب IranAPI": "Create IranAPI account",
  "اطلاعات حساب": "Account info",
  "پروفایل توسعه‌دهنده": "Developer profile",
  "نام خانوادگی": "Last name",
  "ایمیل": "Email",
  "تکرار رمز عبور": "Repeat password",
  "شرایط استفاده": "Terms of use",
  "حریم خصوصی": "Privacy",
  "موافقم.": "I agree.",
  "در حال ساخت حساب...": "Creating account...",
  "قبلا ثبت‌نام کرده‌اید؟": "Already registered?",
  "بعد از ثبت‌نام چه چیزی دارید؟": "What you get after signup",
  "دسترسی به داشبورد، ویرایش اطلاعات حساب، مدیریت پروفایل توسعه‌دهنده و مشاهده گزارش مصرف.": "Dashboard access, account editing, developer profile management, and usage reporting.",
  "مسیر شفاف دسترسی API": "Transparent API access path",
  "استاندارد پایه امنیت": "Baseline security standard",
  "حداقل طول رمز عبور ۸ کاراکتر است و نشست کاربر با کوکی امن مدیریت می‌شود.": "Password minimum is 8 characters and user session is managed with a secure cookie.",
  "شرایط استفاده از خدمات": "Terms of service",
  "آخرین به‌روزرسانی": "Last updated",
  "نکات تکمیلی": "Additional notes",
  "اشتراک‌گذاری و کوکی‌ها": "Sharing and cookies",
};

const localizedExactText: Partial<Record<Locale, Record<string, string>>> = {
  ar: {
    "پلتفرم IranAPI • تجربه بازار API با الهام از RapidAPI": "منصة IranAPI • تجربة سوق API مستوحاة من RapidAPI",
    "دنیای بی‌پایان": "عالم لا نهائي",
    "APIهای آماده": "واجهات API جاهزة",
    "یکپارچه‌سازی سریع، مستندات روشن و اتصال قابل پیگیری به سرویس‌های مورد نیاز محصول شما.": "تكامل سريع، وثائق واضحة، ووصول قابل للتتبع إلى الخدمات التي يحتاجها منتجك.",
    "دقایقی تا راه‌اندازی فاصله دارید.": "تفصلك دقائق عن الإطلاق.",
    "جستجو": "بحث",
    "زنده": "مباشر",
    "کاتالوگ IranAPI": "كتالوج IranAPI",
    "تیمی": "جاهز للفرق",
    "داشبورد مشترک": "لوحة مشتركة",
    "کشف APIها": "اكتشاف API",
    "مستندات": "الوثائق",
    "قیمت‌گذاری": "الأسعار",
    "خانه": "الرئيسية",
    "ورود": "تسجيل الدخول",
    "ساخت حساب": "إنشاء حساب",
    "ثبت‌نام": "تسجيل",
    "داشبورد": "لوحة التحكم",
    "نتایج": "النتائج",
    "قبلی": "السابق",
    "بعدی": "التالي",
    "امتیاز": "التقييم",
    "شروع قیمت": "سعر البدء",
    "بدون دسته": "بدون فئة",
    "ویژه": "مميز",
    "محبوب": "شائع",
    "صفحه یافت نشد": "الصفحة غير موجودة",
    "حریم خصوصی": "الخصوصية",
    "شرایط استفاده": "شروط الاستخدام",
    "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید": "قارن السعر وحدود الاستخدام وحالة الخدمات في مكان واحد",
    "ورود به حساب IranAPI": "تسجيل الدخول إلى IranAPI",
    "ساخت حساب IranAPI": "إنشاء حساب IranAPI",
    "هاب API برای تیم‌های محصول، داده و توسعه": "مركز API لفرق المنتج والبيانات والهندسة",
    "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید": "اعثر على API المناسب بسرعة، قارن بثقة، واتصل بسلاسة",
    "IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.": "يجمع IranAPI الخدمات والوثائق والأسعار وحالة الوصول حتى يختار فريقك API المناسب ويديره دون بحث متفرق.",
    "مطالعه مستندات": "قراءة الوثائق",
    "داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری": "بيانات موحدة، وثائق واضحة، وصول قابل للتتبع",
    "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده": "من اختيار الخدمة إلى إدارة الوصول، كل شيء في مسار بسيط",
    "جست‌وجوی سریع و قابل اعتماد": "بحث سريع وموثوق",
    "مستندات و قیمت‌گذاری کنار هم": "الوثائق والأسعار معا",
    "داشبورد آماده برای عملیات": "لوحة جاهزة للعمليات",
    "APIهای قابل بررسی": "واجهات API قابلة للتصفح",
    "دسته‌بندی‌ها": "الفئات",
    "دسته‌های پرکاربرد": "الفئات الشائعة",
    "پیشنهادهای شروع": "اقتراحات البداية",
    "دیدن همه APIها": "عرض كل APIs",
    "مشاهده جزئیات و مستندات": "عرض التفاصيل والوثائق",
    "IranAPI pages synced into one marketplace UX": "صفحات IranAPI موحدة في تجربة سوق واحدة",
    "RapidAPI-inspired": "مستوحى من RapidAPI",
    "API Hub": "مركز API",
    "Studio": "الاستوديو",
    "Create Your Organization": "أنشئ مؤسستك",
    "IranAPI for Teams": "IranAPI للفرق",
    "Workspace details": "تفاصيل مساحة العمل",
    "Invite teammates": "دعوة زملاء الفريق",
    "Workspace summary": "ملخص مساحة العمل",
    "Create organization": "إنشاء مؤسسة",
    "Cancel": "إلغاء",
  },
  es: {
    "پلتفرم IranAPI • تجربه بازار API با الهام از RapidAPI": "Plataforma IranAPI • experiencia de marketplace de APIs inspirada en RapidAPI",
    "دنیای بی‌پایان": "Mundo infinito",
    "APIهای آماده": "APIs listas",
    "یکپارچه‌سازی سریع، مستندات روشن و اتصال قابل پیگیری به سرویس‌های مورد نیاز محصول شما.": "Integración rápida, documentación clara y acceso trazable a los servicios que tu producto necesita.",
    "دقایقی تا راه‌اندازی فاصله دارید.": "A minutos del lanzamiento.",
    "جستجو": "Buscar",
    "زنده": "En vivo",
    "کاتالوگ IranAPI": "Catálogo IranAPI",
    "تیمی": "Para equipos",
    "داشبورد مشترک": "Panel compartido",
    "کشف APIها": "Descubrir APIs",
    "مستندات": "Documentación",
    "قیمت‌گذاری": "Precios",
    "خانه": "Inicio",
    "ورود": "Iniciar sesión",
    "ساخت حساب": "Crear cuenta",
    "ثبت‌نام": "Registro",
    "داشبورد": "Panel",
    "نتایج": "Resultados",
    "قبلی": "Anterior",
    "بعدی": "Siguiente",
    "امتیاز": "Calificación",
    "شروع قیمت": "Precio inicial",
    "بدون دسته": "Sin categoría",
    "ویژه": "Destacado",
    "محبوب": "Popular",
    "صفحه یافت نشد": "Página no encontrada",
    "حریم خصوصی": "Privacidad",
    "شرایط استفاده": "Términos de uso",
    "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید": "Compara precio, límites de uso y estado del servicio en un solo lugar",
    "ورود به حساب IranAPI": "Iniciar sesión en IranAPI",
    "ساخت حساب IranAPI": "Crear cuenta IranAPI",
    "هاب API برای تیم‌های محصول، داده و توسعه": "Hub de APIs para equipos de producto, datos e ingeniería",
    "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید": "Encuentra la API correcta rápido, compara con confianza y conecta sin fricción",
    "IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.": "IranAPI reúne servicios, documentación, precios y estado de acceso para que tu equipo elija y gestione la API correcta sin búsquedas dispersas.",
    "مطالعه مستندات": "Leer documentación",
    "داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری": "Datos unificados, documentación clara, acceso trazable",
    "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده": "Desde elegir un servicio hasta gestionar acceso, todo en un flujo simple",
    "جست‌وجوی سریع و قابل اعتماد": "Búsqueda rápida y confiable",
    "مستندات و قیمت‌گذاری کنار هم": "Documentación y precios juntos",
    "داشبورد آماده برای عملیات": "Panel listo para operaciones",
    "APIهای قابل بررسی": "APIs explorables",
    "دسته‌بندی‌ها": "Categorías",
    "دسته‌های پرکاربرد": "Categorías populares",
    "پیشنهادهای شروع": "Sugerencias iniciales",
    "دیدن همه APIها": "Ver todas las APIs",
    "مشاهده جزئیات و مستندات": "Ver detalles y documentación",
    "IranAPI pages synced into one marketplace UX": "Páginas de IranAPI sincronizadas en una experiencia de marketplace",
    "RapidAPI-inspired": "Inspirado en RapidAPI",
    "API Hub": "Hub de APIs",
    "Studio": "Studio",
    "Create Your Organization": "Crea tu organización",
    "IranAPI for Teams": "IranAPI para equipos",
    "Workspace details": "Detalles del espacio",
    "Invite teammates": "Invitar compañeros",
    "Workspace summary": "Resumen del espacio",
    "Create organization": "Crear organización",
    "Cancel": "Cancelar",
  },
  fr: {
    "پلتفرم IranAPI • تجربه بازار API با الهام از RapidAPI": "Plateforme IranAPI • expérience de marketplace API inspirée de RapidAPI",
    "دنیای بی‌پایان": "Monde infini",
    "APIهای آماده": "API prêtes",
    "یکپارچه‌سازی سریع، مستندات روشن و اتصال قابل پیگیری به سرویس‌های مورد نیاز محصول شما.": "Intégration rapide, documentation claire et accès traçable aux services dont votre produit a besoin.",
    "دقایقی تا راه‌اندازی فاصله دارید.": "À quelques minutes du lancement.",
    "جستجو": "Rechercher",
    "زنده": "En ligne",
    "کاتالوگ IranAPI": "Catalogue IranAPI",
    "تیمی": "Pour équipes",
    "داشبورد مشترک": "Tableau partagé",
    "کشف APIها": "Découvrir les API",
    "مستندات": "Documentation",
    "قیمت‌گذاری": "Tarifs",
    "خانه": "Accueil",
    "ورود": "Connexion",
    "ساخت حساب": "Créer un compte",
    "ثبت‌نام": "Inscription",
    "داشبورد": "Tableau de bord",
    "نتایج": "Résultats",
    "قبلی": "Précédent",
    "بعدی": "Suivant",
    "امتیاز": "Note",
    "شروع قیمت": "Prix de départ",
    "بدون دسته": "Sans catégorie",
    "ویژه": "Mis en avant",
    "محبوب": "Populaire",
    "صفحه یافت نشد": "Page introuvable",
    "حریم خصوصی": "Confidentialité",
    "شرایط استفاده": "Conditions d’utilisation",
    "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید": "Comparez prix, limites d’usage et état des services au même endroit",
    "ورود به حساب IranAPI": "Connexion à IranAPI",
    "ساخت حساب IranAPI": "Créer un compte IranAPI",
    "هاب API برای تیم‌های محصول، داده و توسعه": "Hub API pour les équipes produit, data et ingénierie",
    "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید": "Trouvez vite la bonne API, comparez avec confiance et connectez sans friction",
    "IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.": "IranAPI regroupe services, documentation, tarifs et état d’accès pour aider votre équipe à choisir et gérer la bonne API sans recherches dispersées.",
    "مطالعه مستندات": "Lire la documentation",
    "داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری": "Données unifiées, documentation claire, accès traçable",
    "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده": "Du choix du service à la gestion des accès, tout suit un flux simple",
    "جست‌وجوی سریع و قابل اعتماد": "Recherche rapide et fiable",
    "مستندات و قیمت‌گذاری کنار هم": "Documentation et tarifs ensemble",
    "داشبورد آماده برای عملیات": "Tableau prêt pour les opérations",
    "APIهای قابل بررسی": "API explorables",
    "دسته‌بندی‌ها": "Catégories",
    "دسته‌های پرکاربرد": "Catégories populaires",
    "پیشنهادهای شروع": "Suggestions de départ",
    "دیدن همه APIها": "Voir toutes les API",
    "مشاهده جزئیات و مستندات": "Voir détails et documentation",
    "IranAPI pages synced into one marketplace UX": "Pages IranAPI synchronisées dans une expérience marketplace",
    "RapidAPI-inspired": "Inspiré de RapidAPI",
    "API Hub": "Hub API",
    "Studio": "Studio",
    "Create Your Organization": "Créer votre organisation",
    "IranAPI for Teams": "IranAPI pour les équipes",
    "Workspace details": "Détails de l’espace",
    "Invite teammates": "Inviter des coéquipiers",
    "Workspace summary": "Résumé de l’espace",
    "Create organization": "Créer l’organisation",
    "Cancel": "Annuler",
  },
  tr: {
    "پلتفرم IranAPI • تجربه بازار API با الهام از RapidAPI": "IranAPI platformu • RapidAPI’den ilham alan API pazarı deneyimi",
    "دنیای بی‌پایان": "Sonsuz dünya",
    "APIهای آماده": "Hazır API’ler",
    "یکپارچه‌سازی سریع، مستندات روشن و اتصال قابل پیگیری به سرویس‌های مورد نیاز محصول شما.": "Hızlı entegrasyon, net dokümanlar ve ürününüzün ihtiyaç duyduğu servislere izlenebilir erişim.",
    "دقایقی تا راه‌اندازی فاصله دارید.": "Yayına dakikalar kaldı.",
    "جستجو": "Ara",
    "زنده": "Canlı",
    "کاتالوگ IranAPI": "IranAPI kataloğu",
    "تیمی": "Ekip hazır",
    "داشبورد مشترک": "Paylaşılan panel",
    "کشف APIها": "API keşfet",
    "مستندات": "Dokümanlar",
    "قیمت‌گذاری": "Fiyatlandırma",
    "خانه": "Ana sayfa",
    "ورود": "Giriş yap",
    "ساخت حساب": "Hesap oluştur",
    "ثبت‌نام": "Kaydol",
    "داشبورد": "Panel",
    "نتایج": "Sonuçlar",
    "قبلی": "Önceki",
    "بعدی": "Sonraki",
    "امتیاز": "Puan",
    "شروع قیمت": "Başlangıç fiyatı",
    "بدون دسته": "Kategorisiz",
    "ویژه": "Öne çıkan",
    "محبوب": "Popüler",
    "صفحه یافت نشد": "Sayfa bulunamadı",
    "حریم خصوصی": "Gizlilik",
    "شرایط استفاده": "Kullanım şartları",
    "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید": "Fiyatı, kullanım limitlerini ve servis durumunu tek yerde karşılaştırın",
    "ورود به حساب IranAPI": "IranAPI hesabına giriş",
    "ساخت حساب IranAPI": "IranAPI hesabı oluştur",
    "هاب API برای تیم‌های محصول، داده و توسعه": "Ürün, veri ve mühendislik ekipleri için API Hub",
    "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید": "Doğru API’yi hızlı bulun, güvenle karşılaştırın, sorunsuz bağlanın",
    "IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.": "IranAPI servisleri, dokümanları, fiyatları ve erişim durumunu bir araya getirir; ekibiniz doğru API’yi dağınık arama yapmadan seçip yönetir.",
    "مطالعه مستندات": "Dokümanları oku",
    "داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری": "Birleşik veri, net dokümanlar, izlenebilir erişim",
    "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده": "Servis seçiminden erişim yönetimine kadar her şey sade bir akışta",
    "جست‌وجوی سریع و قابل اعتماد": "Hızlı ve güvenilir arama",
    "مستندات و قیمت‌گذاری کنار هم": "Dokümanlar ve fiyatlar birlikte",
    "داشبورد آماده برای عملیات": "Operasyon hazır panel",
    "APIهای قابل بررسی": "İncelenebilir API’ler",
    "دسته‌بندی‌ها": "Kategoriler",
    "دسته‌های پرکاربرد": "Popüler kategoriler",
    "پیشنهادهای شروع": "Başlangıç önerileri",
    "دیدن همه APIها": "Tüm API’leri gör",
    "مشاهده جزئیات و مستندات": "Detayları ve dokümanları gör",
    "IranAPI pages synced into one marketplace UX": "IranAPI sayfaları tek pazar deneyiminde senkron",
    "RapidAPI-inspired": "RapidAPI’den ilham aldı",
    "API Hub": "API Hub",
    "Studio": "Studio",
    "Create Your Organization": "Organizasyon oluştur",
    "IranAPI for Teams": "Ekipler için IranAPI",
    "Workspace details": "Çalışma alanı detayları",
    "Invite teammates": "Ekip arkadaşlarını davet et",
    "Workspace summary": "Çalışma alanı özeti",
    "Create organization": "Organizasyon oluştur",
    "Cancel": "İptal",
  },
};

const phraseReplacements: Partial<Record<Locale, Array<[RegExp, string]>>> = {
  en: [
  [/^(\d+|[۰-۹٬]+) API پیدا شد$/, "$1 APIs found"],
  [/^صفحه (.+) از (.+)$/, "Page $1 of $2"],
  [/^دسته: (.+)$/, "Category: $1"],
  [/^عبارت: (.+)$/, "Query: $1"],
  [/^امتیاز (.+)$/, "Rating $1"],
  [/^شروع قیمت: (.+)$/, "Starting price: $1"],
  [/^(.+) سرویس$/, "$1 services"],
  [/^آخرین به‌روزرسانی: (.+)$/, "Last updated: $1"],
  [/^انتشار API: (.+)$/, "API publishing: $1"],
  [/^درخواست ماهانه: (.+)$/, "Monthly requests: $1"],
  [/^درخواست روزانه: (.+)$/, "Daily requests: $1"],
  [/^وضعیت دسترسی: (.+)$/, "Access status: $1"],
  ],
  ar: [
    [/^(\d+|[۰-۹٬]+) API پیدا شد$/, "تم العثور على $1 API"],
    [/^صفحه (.+) از (.+)$/, "صفحة $1 من $2"],
    [/^دسته: (.+)$/, "الفئة: $1"],
    [/^عبارت: (.+)$/, "العبارة: $1"],
    [/^امتیاز (.+)$/, "التقييم $1"],
    [/^شروع قیمت: (.+)$/, "سعر البدء: $1"],
    [/^(.+) سرویس$/, "$1 خدمات"],
    [/^آخرین به‌روزرسانی: (.+)$/, "آخر تحديث: $1"],
    [/^انتشار API: (.+)$/, "نشر API: $1"],
    [/^درخواست ماهانه: (.+)$/, "طلبات شهرية: $1"],
    [/^درخواست روزانه: (.+)$/, "طلبات يومية: $1"],
    [/^وضعیت دسترسی: (.+)$/, "حالة الوصول: $1"],
  ],
  es: [
    [/^(\d+|[۰-۹٬]+) API پیدا شد$/, "$1 APIs encontradas"],
    [/^صفحه (.+) از (.+)$/, "Página $1 de $2"],
    [/^دسته: (.+)$/, "Categoría: $1"],
    [/^عبارت: (.+)$/, "Consulta: $1"],
    [/^امتیاز (.+)$/, "Calificación $1"],
    [/^شروع قیمت: (.+)$/, "Precio inicial: $1"],
    [/^(.+) سرویس$/, "$1 servicios"],
    [/^آخرین به‌روزرسانی: (.+)$/, "Última actualización: $1"],
    [/^انتشار API: (.+)$/, "Publicación API: $1"],
    [/^درخواست ماهانه: (.+)$/, "Solicitudes mensuales: $1"],
    [/^درخواست روزانه: (.+)$/, "Solicitudes diarias: $1"],
    [/^وضعیت دسترسی: (.+)$/, "Estado de acceso: $1"],
  ],
  fr: [
    [/^(\d+|[۰-۹٬]+) API پیدا شد$/, "$1 API trouvées"],
    [/^صفحه (.+) از (.+)$/, "Page $1 sur $2"],
    [/^دسته: (.+)$/, "Catégorie : $1"],
    [/^عبارت: (.+)$/, "Recherche : $1"],
    [/^امتیاز (.+)$/, "Note $1"],
    [/^شروع قیمت: (.+)$/, "Prix de départ : $1"],
    [/^(.+) سرویس$/, "$1 services"],
    [/^آخرین به‌روزرسانی: (.+)$/, "Dernière mise à jour : $1"],
    [/^انتشار API: (.+)$/, "Publication API : $1"],
    [/^درخواست ماهانه: (.+)$/, "Requêtes mensuelles : $1"],
    [/^درخواست روزانه: (.+)$/, "Requêtes quotidiennes : $1"],
    [/^وضعیت دسترسی: (.+)$/, "État d’accès : $1"],
  ],
  tr: [
    [/^(\d+|[۰-۹٬]+) API پیدا شد$/, "$1 API bulundu"],
    [/^صفحه (.+) از (.+)$/, "Sayfa $1 / $2"],
    [/^دسته: (.+)$/, "Kategori: $1"],
    [/^عبارت: (.+)$/, "Arama: $1"],
    [/^امتیاز (.+)$/, "Puan $1"],
    [/^شروع قیمت: (.+)$/, "Başlangıç fiyatı: $1"],
    [/^(.+) سرویس$/, "$1 servis"],
    [/^آخرین به‌روزرسانی: (.+)$/, "Son güncelleme: $1"],
    [/^انتشار API: (.+)$/, "API yayını: $1"],
    [/^درخواست ماهانه: (.+)$/, "Aylık istek: $1"],
    [/^درخواست روزانه: (.+)$/, "Günlük istek: $1"],
    [/^وضعیت دسترسی: (.+)$/, "Erişim durumu: $1"],
  ],
};

const attributeText: Partial<Record<Locale, Record<string, string>>> = {
  en: {
    "جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)": "Search APIs... (e.g. payments, AI, SMS)",
    "مثلا پرداخت، نقشه، پیامک، هوش مصنوعی": "e.g. payments, maps, SMS, AI",
    "تغییر حالت نمایش": "Toggle theme",
    "تغییر تم": "Toggle theme",
    "پذیرش شرایط استفاده و حریم خصوصی": "Accept terms of use and privacy policy",
  },
  ar: {
    "جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)": "ابحث في APIs... (مثلا: الدفع، الذكاء الاصطناعي، SMS)",
    "مثلا پرداخت، نقشه، پیامک، هوش مصنوعی": "مثلا الدفع، الخرائط، SMS، الذكاء الاصطناعي",
    "تغییر حالت نمایش": "تبديل السمة",
    "تغییر تم": "تبديل السمة",
    "پذیرش شرایط استفاده و حریم خصوصی": "قبول شروط الاستخدام والخصوصية",
  },
  es: {
    "جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)": "Buscar APIs... (p. ej., pagos, IA, SMS)",
    "مثلا پرداخت، نقشه، پیامک، هوش مصنوعی": "p. ej., pagos, mapas, SMS, IA",
    "تغییر حالت نمایش": "Cambiar tema",
    "تغییر تم": "Cambiar tema",
    "پذیرش شرایط استفاده و حریم خصوصی": "Aceptar términos y privacidad",
  },
  fr: {
    "جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)": "Rechercher des API... (ex. paiements, IA, SMS)",
    "مثلا پرداخت، نقشه، پیامک، هوش مصنوعی": "ex. paiements, cartes, SMS, IA",
    "تغییر حالت نمایش": "Changer le thème",
    "تغییر تم": "Changer le thème",
    "پذیرش شرایط استفاده و حریم خصوصی": "Accepter les conditions et la confidentialité",
  },
  tr: {
    "جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)": "API ara... (örn. ödeme, yapay zeka, SMS)",
    "مثلا پرداخت، نقشه، پیامک، هوش مصنوعی": "örn. ödeme, harita, SMS, yapay zeka",
    "تغییر حالت نمایش": "Temayı değiştir",
    "تغییر تم": "Temayı değiştir",
    "پذیرش شرایط استفاده و حریم خصوصی": "Kullanım şartları ve gizliliği kabul et",
  },
};

const excludedTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);

function translateText(value: string, locale: Locale) {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  const exact = locale === "en" ? exactText[trimmed] : localizedExactText[locale]?.[trimmed] || exactText[trimmed];
  const translated =
    exact ||
    (phraseReplacements[locale] || phraseReplacements.en || []).reduce<string | null>(
      (current, [pattern, replacement]) => current || (pattern.test(trimmed) ? trimmed.replace(pattern, replacement) : null),
      null,
    );

  if (!translated || translated === trimmed) {
    return value;
  }

  return value.replace(trimmed, translated);
}

function shouldSkip(node: Node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest("script,style,noscript,code,pre,textarea,[data-no-translate]")) || excludedTags.has(parent.tagName);
}

export function RuntimeTranslator() {
  const { locale } = useI18n();
  const originals = useRef(new WeakMap<Text, string>());

  useEffect(() => {
    const restore = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        const original = originals.current.get(node);
        if (original !== undefined) {
          if (node.nodeValue !== original) {
            node.nodeValue = original;
          }
        }
        node = walker.nextNode() as Text | null;
      }

      document.querySelectorAll<HTMLElement>("[data-i18n-placeholder-original],[data-i18n-label-original],[data-i18n-title-original]").forEach((element) => {
        const placeholder = element.dataset.i18nPlaceholderOriginal;
        const label = element.dataset.i18nLabelOriginal;
        const title = element.dataset.i18nTitleOriginal;
        if (placeholder !== undefined && element.getAttribute("placeholder") !== placeholder) element.setAttribute("placeholder", placeholder);
        if (label !== undefined && element.getAttribute("aria-label") !== label) element.setAttribute("aria-label", label);
        if (title !== undefined && element.getAttribute("title") !== title) element.setAttribute("title", title);
      });
    };

    const translate = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        if (!shouldSkip(node)) {
          if (!originals.current.has(node)) {
            originals.current.set(node, node.nodeValue || "");
          }
          const nextValue = translateText(originals.current.get(node) || node.nodeValue || "", locale);
          if (node.nodeValue !== nextValue) {
            node.nodeValue = nextValue;
          }
        }
        node = walker.nextNode() as Text | null;
      }

      document.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title]").forEach((element) => {
        (["placeholder", "aria-label", "title"] as const).forEach((attr) => {
          const value = element.getAttribute(attr);
          if (!value) return;
          const key = attr === "placeholder" ? "i18nPlaceholderOriginal" : attr === "aria-label" ? "i18nLabelOriginal" : "i18nTitleOriginal";
          if (!element.dataset[key]) {
            element.dataset[key] = value;
          }
          const originalValue = element.dataset[key] || value;
          const translated = attributeText[locale]?.[originalValue] || attributeText.en?.[originalValue] || translateText(originalValue, locale);
          if (element.getAttribute(attr) !== translated) {
            element.setAttribute(attr, translated);
          }
        });
      });
    };

    const apply = () => {
      if (locale !== "fa") {
        translate();
      } else {
        restore();
      }
    };

    apply();
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(apply);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] });

    return () => observer.disconnect();
  }, [locale]);

  return null;
}
