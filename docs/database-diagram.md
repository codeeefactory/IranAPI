# IranAPI MongoDB Logical Data Model

Runtime portal data is stored through `MongoRepository`. MongoDB does not
enforce foreign keys; arrows below represent application-level ID references.
`users.profile` is embedded inside each user document.

```mermaid
erDiagram
  USERS {
    int _id PK
    string username UK
    string email
    string password_hash
    boolean is_active
    boolean is_staff
    object profile "embedded phone/company/bio/avatar/api_key"
  }

  SESSIONS {
    string _id PK
    int user_id FK
    datetime expires_at
    datetime last_seen_at
  }

  LEGACY_TOKENS {
    string _id PK
    int user_id FK
    datetime created_at
  }

  CATEGORIES {
    int _id PK
    string slug UK
    string name
    string name_en
    string color
  }

  APIS {
    int _id PK
    int category_id FK
    int created_by_user_id FK
    string slug UK
    string base_url
    string status
    string publication_status
    float rating
  }

  PRICING_PLANS {
    int _id PK
    int api_id FK
    string plan_type
    float price
    string currency
    int requests_per_month
    boolean is_active
  }

  DOCUMENTATIONS {
    int _id PK
    int api_id FK
    string slug
    string title
    int order
    boolean is_active
  }

  API_ENDPOINTS {
    int _id PK
    int api_id FK
    string method
    string path
    object request_schema
    object response_schema
    boolean requires_auth
  }

  API_RATINGS {
    int _id PK
    int user_id FK
    int api_id FK
    int value
  }

  ACCESS_GRANTS {
    int _id PK
    int user_id FK
    int api_id FK
    int pricing_plan_id FK
    string source
    string status
  }

  API_USAGE {
    int _id PK
    int user_id FK
    int api_id FK
    int access_grant_id FK
    string source
    int requests_count
    int status_code
    int latency_ms
  }

  ORGANIZATIONS {
    int _id PK
    int owner_user_id FK
    string slug UK
    string name
    string region
    string status
  }

  STUDIO_FLOWS {
    int _id PK
    int user_id FK
    int api_id FK
    string slug UK
    object nodes
    string region
    string status
  }

  SUBSCRIPTION_PLANS {
    int _id PK
    string slug UK
    string plan_type
    float price
    string interval
    int api_publish_limit
    int included_requests
  }

  USER_SUBSCRIPTIONS {
    int _id PK
    int user_id FK
    int subscription_plan_id FK
    string status
    datetime starts_at
    datetime renews_at
  }

  SUBSCRIPTION_CHECKOUTS {
    int _id PK
    int user_id FK
    int subscription_plan_id FK
    int subscription_id FK
    string status
    float amount
    string gateway
    datetime expires_at
  }

  USERS ||--o{ SESSIONS : authenticates
  USERS ||--o{ LEGACY_TOKENS : owns
  USERS ||--o{ APIS : publishes
  USERS ||--o{ API_RATINGS : submits
  USERS ||--o{ ACCESS_GRANTS : receives
  USERS ||--o{ API_USAGE : generates
  USERS ||--o{ ORGANIZATIONS : owns
  USERS ||--o{ STUDIO_FLOWS : creates
  USERS ||--o{ USER_SUBSCRIPTIONS : holds
  USERS ||--o{ SUBSCRIPTION_CHECKOUTS : starts

  CATEGORIES ||--o{ APIS : groups
  APIS ||--o{ PRICING_PLANS : offers
  APIS ||--o{ DOCUMENTATIONS : documents
  APIS ||--o{ API_ENDPOINTS : exposes
  APIS ||--o{ API_RATINGS : receives
  APIS ||--o{ ACCESS_GRANTS : grants
  APIS ||--o{ API_USAGE : records
  APIS ||--o{ STUDIO_FLOWS : targets

  PRICING_PLANS ||--o{ ACCESS_GRANTS : defines
  ACCESS_GRANTS ||--o{ API_USAGE : authorizes
  SUBSCRIPTION_PLANS ||--o{ USER_SUBSCRIPTIONS : defines
  SUBSCRIPTION_PLANS ||--o{ SUBSCRIPTION_CHECKOUTS : selected_for
  USER_SUBSCRIPTIONS o|--o{ SUBSCRIPTION_CHECKOUTS : activated_by
```

## Collection groups

- Identity: `users`, `sessions`, `legacy_tokens`.
- Catalog: `categories`, `apis`, `pricing_plans`, `documentations`,
  `api_endpoints`, `api_ratings`.
- Access and telemetry: `access_grants`, `api_usage`.
- Workspace: `organizations`, `studio_flows`.
- Portal billing: `subscription_plans`, `user_subscriptions`,
  `subscription_checkouts`.

## Important distinctions

- API-specific `pricing_plans` define access to one API.
- Portal-wide `subscription_plans` define IranAPI account limits and billing.
- `subscription_checkouts` use `gateway: "manual"` in current implementation.
- `api_usage` stores aggregate or event-like usage records from sources such as
  Caller, Studio, and imported marketplace synchronization.
- Django ORM models and migrations remain in repository for legacy/admin
  compatibility, but `/api/v1/` reads and writes through `MongoRepository`.

PlantUML version: [`database-diagram.puml`](database-diagram.puml)
