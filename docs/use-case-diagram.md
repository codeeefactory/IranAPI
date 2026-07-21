# IranAPI Project Use-Case Diagrams

These diagrams describe implemented behavior exposed by the canonical `/api/v1/`
API and current React portal.

## 1. Public discovery and identity

```mermaid
flowchart LR
  classDef actor fill:#f8fafc,stroke:#475569,color:#0f172a
  classDef usecase fill:#eff6ff,stroke:#2563eb,color:#0f172a
  classDef external fill:#fff7ed,stroke:#ea580c,color:#7c2d12

  visitor["Visitor<br/>مهمان"]:::actor
  developer["Developer<br/>توسعه‌دهنده"]:::actor
  social["Social identity provider<br/>ارائه‌دهنده ورود اجتماعی"]:::external

  subgraph portal["IranAPI portal"]
    browse(["Browse, search, and filter APIs<br/>مرور، جستجو و فیلتر APIها"]):::usecase
    details(["View API details and similar APIs<br/>مشاهده جزئیات و APIهای مشابه"]):::usecase
    docs(["Read plans, endpoints, and docs<br/>مشاهده پلن‌ها، endpointها و مستندات"]):::usecase
    schema(["Read OpenAPI schema<br/>دریافت OpenAPI"]):::usecase
    register(["Register account<br/>ثبت‌نام"]):::usecase
    login(["Sign in<br/>ورود"]):::usecase
    social_login(["Start social sign-in<br/>شروع ورود اجتماعی"]):::usecase
    logout(["Sign out<br/>خروج"]):::usecase
  end

  visitor --- browse
  visitor --- details
  visitor --- docs
  visitor --- schema
  visitor --- register
  visitor --- login
  visitor --- social_login

  developer --- browse
  developer --- details
  developer --- docs
  developer --- logout

  social --- social_login
  details -. includes .-> docs
```

## 2. Developer workspace and billing

```mermaid
flowchart LR
  classDef actor fill:#f8fafc,stroke:#475569,color:#0f172a
  classDef usecase fill:#ecfdf5,stroke:#059669,color:#052e16
  classDef external fill:#fff7ed,stroke:#ea580c,color:#7c2d12

  developer["Authenticated developer<br/>توسعه‌دهنده واردشده"]:::actor
  upstream["Upstream API service<br/>سرویس API مقصد"]:::external

  subgraph workspace["IranAPI developer workspace"]
    account(["Manage account and profile<br/>مدیریت حساب و پروفایل"]):::usecase
    key(["Rotate API key<br/>تعویض کلید API"]):::usecase
    org(["Create and list organizations<br/>ایجاد و مشاهده سازمان‌ها"]):::usecase
    subscription(["View current subscription<br/>مشاهده اشتراک فعلی"]):::usecase
    checkout(["Create, inspect, cancel, or confirm checkout<br/>مدیریت پرداخت اشتراک"]):::usecase
    access(["View API access grants<br/>مشاهده دسترسی‌های API"]):::usecase
    rate(["Rate an API<br/>امتیازدهی به API"]):::usecase
    release(["Publish an API to Explore<br/>انتشار API در Explore"]):::usecase
    caller(["Execute API request in Caller<br/>اجرای درخواست در Caller"]):::usecase
    studio(["Create and deploy Studio flow<br/>ساخت و استقرار جریان Studio"]):::usecase
    usage(["View usage history and stats<br/>مشاهده تاریخچه و آمار مصرف"]):::usecase
  end

  developer --- account
  developer --- key
  developer --- org
  developer --- subscription
  developer --- checkout
  developer --- access
  developer --- rate
  developer --- release
  developer --- caller
  developer --- studio
  developer --- usage

  caller --- upstream
  checkout -. activates .-> subscription
  caller -. records .-> usage
  studio -. records .-> usage
```

## 3. Operations and external boundaries

```mermaid
flowchart LR
  classDef actor fill:#f8fafc,stroke:#475569,color:#0f172a
  classDef usecase fill:#f5f3ff,stroke:#7c3aed,color:#2e1065
  classDef external fill:#fff7ed,stroke:#ea580c,color:#7c2d12

  admin["Admin / operator<br/>مدیر سیستم"]:::actor
  rapidapi["RapidAPI marketplace<br/>بازار خارجی"]:::external

  subgraph operations["IranAPI operations"]
    catalog(["Manage legacy ORM catalog<br/>مدیریت کاتالوگ ORM قدیمی"]):::usecase
    content(["Manage legacy pricing and docs<br/>مدیریت قیمت و مستندات قدیمی"]):::usecase
    users(["Manage Django users and profiles<br/>مدیریت کاربران و پروفایل‌های Django"]):::usecase
    grants(["Review legacy usage records<br/>بررسی رکوردهای مصرف قدیمی"]):::usecase
    publication(["Maintain publication metadata<br/>مدیریت متادیتای انتشار"]):::usecase
    health(["Monitor health and schema<br/>بررسی سلامت و schema"]):::usecase
  end

  admin --- catalog
  admin --- content
  admin --- users
  admin --- grants
  admin --- publication
  admin --- health

  rapidapi --- publication
  rapidapi --- health
```

## Actors and boundaries

- `Visitor`: anonymous catalog and documentation reader.
- `Authenticated developer`: portal user with account, publishing, billing,
  caller, Studio, access, and usage features.
- `Admin / operator`: manages legacy Django ORM/admin records and monitors
  operational endpoints. Mongo catalog administration has no dedicated admin UI.
- `Social identity provider`: configured external authentication redirect target.
- `Upstream API service`: destination called by authenticated Caller requests.
- `RapidAPI marketplace`: external publication-metadata boundary. Live webhook
  ingestion and externally driven quota enforcement are not implemented.

## Editable UML source

PlantUML version: [`use-case-diagram.puml`](use-case-diagram.puml)

Database diagram: [`database-diagram.md`](database-diagram.md)
