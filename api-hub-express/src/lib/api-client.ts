import axios, { AxiosError } from "axios";
import type { CatalogApiDetail, CatalogApiSummary, CatalogCategory } from "@/types/catalog";

export type PaginatedResponse<T> = {
  count: number;
  page: number;
  page_size: number;
  results: T[];
};

export type ApiListParams = {
  category?: string | null;
  featured?: boolean;
  popular?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

export class ApiClientError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export const http = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string; error?: { message?: string } }>) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message =
      payload?.detail ||
      payload?.message ||
      payload?.error?.message ||
      error.message ||
      "IranAPI request failed.";
    return Promise.reject(new ApiClientError(message, status, payload));
  },
);

function cleanParams(params: ApiListParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export const catalogApi = {
  async listApis(params?: ApiListParams): Promise<PaginatedResponse<CatalogApiSummary>> {
    const { data } = await http.get<PaginatedResponse<CatalogApiSummary>>("/catalog/apis/", {
      params: cleanParams(params),
    });
    return data;
  },

  async getApi(slug: string): Promise<CatalogApiDetail> {
    const { data } = await http.get<CatalogApiDetail>(`/catalog/apis/${encodeURIComponent(slug)}/`);
    return data;
  },

  async listCategories(): Promise<PaginatedResponse<CatalogCategory>> {
    const { data } = await http.get<PaginatedResponse<CatalogCategory>>("/catalog/categories/", {
      params: { page_size: 100 },
    });
    return data;
  },
};
