# IranAPI Use Case Diagram

This diagram reflects the current implemented scope of the project after the v1/session-auth, API release, and IranAPI subscription pass.

It intentionally does **not** model:

- live RapidAPI webhook ingestion
- local quota enforcement driven by external subscriptions

Those flows are still outside the currently implemented product boundary.

## Rendered Diagram

```mermaid
flowchart LR
  classDef actor fill:#f8fafc,stroke:#475569,stroke-width:1px,color:#0f172a;
  classDef usecase fill:#eff6ff,stroke:#2563eb,stroke-width:1px,color:#0f172a;
  classDef external fill:#fff7ed,stroke:#ea580c,stroke-width:1px,color:#7c2d12;

  visitor["Visitor<br/>مهمان"]:::actor
  developer["Authenticated Developer<br/>توسعه دهنده"]:::actor
  admin["Admin / Operator<br/>ادمین"]:::actor
  rapidapi["RapidAPI Marketplace<br/>سیستم خارجی"]:::external

  subgraph IranAPI["IranAPI Portal & API Marketplace"]
    uc_catalog(["Browse API catalog<br/>مرور کاتالوگ API"]):::usecase
    uc_search(["Search and filter APIs<br/>جستجو و فیلتر APIها"]):::usecase
    uc_view(["View API details, pricing, and docs<br/>مشاهده جزئیات، قیمت و مستندات"]):::usecase
    uc_register(["Register portal account<br/>ثبت نام در پرتال"]):::usecase
    uc_auth(["Sign in and sign out<br/>ورود و خروج"]):::usecase
    uc_profile(["Manage account and profile<br/>مدیریت حساب و پروفایل"]):::usecase
    uc_subscribe(["Checkout and activate subscription<br/>پرداخت و فعال سازی اشتراک"]):::usecase
    uc_publish(["Release API to Explore<br/>انتشار API در اکسپلور"]):::usecase
    uc_rate(["Rate an API<br/>امتیازدهی به API"]):::usecase
    uc_access(["View access grants<br/>مشاهده دسترسی ها"]):::usecase
    uc_usage(["View usage stats and history<br/>مشاهده آمار و تاریخچه مصرف"]):::usecase
    uc_schema(["Access OpenAPI schema<br/>دریافت OpenAPI"]):::usecase
    uc_catalog_admin(["Manage categories and APIs<br/>مدیریت دسته بندی ها و APIها"]):::usecase
    uc_content_admin(["Manage plans and documentation<br/>مدیریت پلن ها و مستندات"]):::usecase
    uc_publish_admin(["Manage publication metadata<br/>مدیریت متادیتای انتشار"]):::usecase
    uc_access_admin(["Review access grants and usage records<br/>بررسی دسترسی ها و رکوردهای مصرف"]):::usecase
  end

  visitor --- uc_catalog
  visitor --- uc_search
  visitor --- uc_view
  visitor --- uc_register
  visitor --- uc_auth
  visitor --- uc_schema

  developer --- uc_catalog
  developer --- uc_search
  developer --- uc_view
  developer --- uc_auth
  developer --- uc_profile
  developer --- uc_subscribe
  developer --- uc_publish
  developer --- uc_rate
  developer --- uc_access
  developer --- uc_usage

  admin --- uc_schema
  admin --- uc_catalog_admin
  admin --- uc_content_admin
  admin --- uc_publish_admin
  admin --- uc_access_admin

  rapidapi --- uc_schema
  rapidapi --- uc_publish_admin
```

## Actors

- `Visitor / مهمان`: browses the public catalog, reads documentation, and can create a portal account.
- `Authenticated Developer / توسعه دهنده`: manages the portal account, checks out subscription plans, publishes APIs, views access and usage, and rates APIs.
- `Admin / Operator / ادمین`: manages catalog content, pricing plans, documentation, publication metadata, and access records.
- `RapidAPI Marketplace / سیستم خارجی`: consumes schema/publication-facing metadata and represents the external marketplace boundary.

## Notes

- User subscription plans are implemented inside IranAPI through checkout sessions and confirmation endpoints in the versioned API.
- Public API access grants can still map external marketplace metadata, but the primary portal subscription state is IranAPI-managed.
- Legacy token and API-key routes still exist for compatibility, but they are not the primary use-case model anymore.
- The canonical system contract for this diagram is the versioned `/api/v1/` API surface.

## Editable Source

If you want a proper UML use-case source file for PlantUML, use:

- [docs/use-case-diagram.puml](/abs/path/will/be/linked/in-chat)
