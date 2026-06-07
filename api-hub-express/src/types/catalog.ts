export type ApiStatus = "active" | "inactive" | "beta" | "deprecated";
export type AuthScheme = "api_key" | "bearer" | "oauth2" | "basic" | "none";
export type PublicationStatus = "draft" | "ready" | "published";
export type PricingKind = "free" | "freemium" | "paid";
export type PricingPlanType = "free" | "basic" | "pro" | "enterprise";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type CatalogCategory = {
  id: number;
  slug: string;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  color: string;
  apis_count: number;
};

export type RapidApiMetadata = {
  canonical_version: string;
  listing_url: string;
  package_slug: string;
  public_auth_scheme: AuthScheme;
  support_url: string;
  publication_status: PublicationStatus;
};

export type CatalogPricingPlan = {
  id: number;
  api_slug: string;
  api_rapidapi_listing_url: string;
  name: string;
  plan_type: PricingPlanType;
  price: string;
  currency: "IRR" | "USD";
  requests_per_month: number | null;
  requests_per_day: number | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  rapidapi_plan_slug: string;
  is_listed_on_rapidapi: boolean;
};

export type CatalogDocumentation = {
  id: number;
  api_slug: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  is_active: boolean;
};

export type CatalogEndpoint = {
  id: number;
  api_slug: string;
  method: HttpMethod;
  path: string;
  name: string;
  summary: string;
  group: string;
  request_schema: Record<string, unknown>;
  response_schema: Record<string, unknown>;
  sample_request: Record<string, unknown>;
  sample_response: Record<string, unknown>;
  requires_auth: boolean;
  is_active: boolean;
};

export type CatalogApiSummary = {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  short_description: string;
  category: CatalogCategory;
  logo: string;
  status: ApiStatus;
  is_featured: boolean;
  is_popular: boolean;
  rating: string;
  rating_count: number;
  views_count: number;
  tags: string[];
  pricing_from: string | null;
  rapidapi: RapidApiMetadata;
};

export type CatalogApiDetail = CatalogApiSummary & {
  description: string;
  base_url: string;
  documentation_url: string;
  banner: string;
  pricing_plans: CatalogPricingPlan[];
  documentations: CatalogDocumentation[];
  endpoints: CatalogEndpoint[];
  created_by_username: string | null;
};

export type ApiItem = Omit<CatalogApiDetail, "endpoints"> & {
  tagline: string;
  categorySlug: string;
  category: string;
  ratingValue: number;
  latency: number;
  uptime: number;
  calls: string;
  pricing: PricingKind;
  apiEndpoints: CatalogEndpoint[];
  endpointCount: number;
  endpoints: number;
  org: string;
};

export type CatalogStats = {
  apiCount: number;
  categoryCount: number;
  uptime: number;
  requestsPerSec: number;
  developers: string;
};
