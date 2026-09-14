import type {
  ApiItem,
  CatalogApiDetail,
  CatalogApiSummary,
  CatalogCategory,
  CatalogEndpoint,
  CatalogStats,
  PricingKind,
} from "@/types/catalog";

function pricingKind(api: CatalogApiSummary | CatalogApiDetail): PricingKind {
  if ("pricing_plans" in api && api.pricing_plans.some((plan) => Number(plan.price) === 0)) return "free";
  if ("pricing_plans" in api && api.pricing_plans.some((plan) => plan.plan_type === "basic")) return "freemium";
  if (api.pricing_from === null || Number(api.pricing_from) === 0) return "free";
  return "paid";
}

function fallbackCategory(api: CatalogApiSummary | CatalogApiDetail): CatalogCategory {
  return (
    api.category ?? {
      id: 0,
      slug: "uncategorized",
      name: "uncategorized",
      name_en: "Uncategorized",
      description: "",
      icon: "#",
      color: "#2563eb",
      apis_count: 0,
    }
  );
}

export function toApiItem(api: CatalogApiSummary | CatalogApiDetail): ApiItem {
  const category = fallbackCategory(api);
  const apiEndpoints: CatalogEndpoint[] = "endpoints" in api ? api.endpoints : [];
  const description = "description" in api ? api.description : api.short_description;
  const base_url = "base_url" in api ? api.base_url : "";
  const documentation_url = "documentation_url" in api ? api.documentation_url : "";
  const banner = "banner" in api ? api.banner : "";
  const pricing_plans = "pricing_plans" in api ? api.pricing_plans : [];
  const documentations = "documentations" in api ? api.documentations : [];
  const created_by_username = "created_by_username" in api ? api.created_by_username : null;

  return {
    ...api,
    description,
    base_url,
    documentation_url,
    banner,
    pricing_plans,
    documentations,
    created_by_username,
    tagline: api.short_description,
    categorySlug: category.slug,
    category: category.slug,
    ratingValue: Number(api.rating),
    calls: `${api.views_count.toLocaleString()} views`,
    pricing: pricingKind(api),
    apiEndpoints,
    endpointCount: apiEndpoints.length,
    endpoints: apiEndpoints.length,
    org: created_by_username ?? "iranapi.dev",
  } as ApiItem;
}

export function buildCatalogStats(apis: ApiItem[], categories: CatalogCategory[]): CatalogStats {
  return {
    apiCount: apis.length,
    categoryCount: categories.length,
    publishedCount: apis.filter((api) => api.rapidapi.publication_status === "published").length,
    totalViews: apis.reduce((total, api) => total + api.views_count, 0),
  };
}
