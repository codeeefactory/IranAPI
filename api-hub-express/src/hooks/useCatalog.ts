import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, type ApiListParams } from "@/lib/api-client";
import { buildCatalogStats, toApiItem } from "@/lib/catalog-adapter";
import { APIS, CATEGORIES, STATS } from "@/data/mock";

export const catalogKeys = {
  all: ["catalog"] as const,
  apis: (params?: ApiListParams) => [...catalogKeys.all, "apis", params ?? {}] as const,
  api: (slug?: string) => [...catalogKeys.all, "api", slug ?? ""] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
};

export function useCatalogApis(params?: ApiListParams) {
  const query = useQuery({
    queryKey: catalogKeys.apis(params),
    queryFn: () => catalogApi.listApis(params),
  });

  const apis = useMemo(() => query.data?.results.map(toApiItem) ?? APIS, [query.data]);
  return { ...query, apis, isFallback: !query.data };
}

export function useCatalogCategories() {
  const query = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: catalogApi.listCategories,
  });

  const categories = query.data?.results ?? CATEGORIES;
  return { ...query, categories, isFallback: !query.data };
}

export function useCatalogHome() {
  const apisQuery = useCatalogApis({ page_size: 24 });
  const categoriesQuery = useCatalogCategories();
  const stats = useMemo(() => {
    if (!apisQuery.data || !categoriesQuery.data) return STATS;
    return buildCatalogStats(apisQuery.apis, categoriesQuery.categories);
  }, [apisQuery.data, apisQuery.apis, categoriesQuery.data, categoriesQuery.categories]);

  return {
    apis: apisQuery.apis,
    categories: categoriesQuery.categories,
    stats,
    isLoading: apisQuery.isLoading || categoriesQuery.isLoading,
    isError: apisQuery.isError || categoriesQuery.isError,
    isFallback: apisQuery.isFallback || categoriesQuery.isFallback,
  };
}

export function useCatalogApi(slug?: string) {
  const fallbackApi = APIS.find((api) => api.slug === slug);
  const query = useQuery({
    queryKey: catalogKeys.api(slug),
    queryFn: () => catalogApi.getApi(slug as string),
    enabled: Boolean(slug),
  });

  const api = query.data ? toApiItem(query.data) : fallbackApi;
  return { ...query, api, isFallback: !query.data };
}
