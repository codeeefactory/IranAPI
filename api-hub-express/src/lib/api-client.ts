import axios, { AxiosError } from "axios";
import type { CatalogApiDetail, CatalogApiSummary, CatalogCategory } from "@/types/catalog";

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string | null;
};

export type UserProfile = {
  id: number;
  user: CurrentUser;
  phone: string;
  company: string;
  bio: string;
  avatar?: string | null;
  api_key?: string | null;
  api_key_preview?: string | null;
  has_api_key: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SessionPayload = {
  authenticated: boolean;
  user: CurrentUser | null;
  profile: UserProfile | null;
  message?: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  password: string;
  password_confirm: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type SocialProvider = "google" | "github" | "gitlab";

export type SocialProviderInfo = {
  slug: SocialProvider;
  label: string;
  enabled: boolean;
  start_url: string;
};

export type PaginatedResponse<T> = {
  count: number;
  page: number;
  page_size: number;
  results: T[];
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
  description: string;
  plan_type: string;
  price: string;
  currency: string;
  interval: string;
  interval_days: number;
  api_publish_limit?: number | null;
  included_requests?: number | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UserSubscription = {
  id: number;
  status: string;
  plan: SubscriptionPlan;
  starts_at?: string | null;
  renews_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SubscriptionCheckout = {
  id: number;
  status: string;
  amount: string;
  currency: string;
  gateway: string;
  reference: string;
  plan: SubscriptionPlan;
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;
  confirmed_at?: string | null;
};

export type SubscriptionCheckoutResponse = {
  message?: string;
  checkout: SubscriptionCheckout;
};

export type SubscriptionConfirmResponse = SubscriptionCheckoutResponse & {
  subscription: UserSubscription;
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

  async listSubscriptionPlans(): Promise<PaginatedResponse<SubscriptionPlan>> {
    const { data } = await http.get<PaginatedResponse<SubscriptionPlan>>("/catalog/subscription-plans/", {
      params: { page_size: 100 },
    });
    return data;
  },
};

export const authApi = {
  async session(): Promise<SessionPayload> {
    const { data } = await http.get<SessionPayload>("/auth/session/");
    return data;
  },

  async login(input: LoginInput): Promise<SessionPayload> {
    const { data } = await http.post<SessionPayload>("/auth/login/", input);
    return data;
  },

  async register(input: RegisterInput): Promise<SessionPayload> {
    const { data } = await http.post<SessionPayload>("/auth/register/", input);
    return data;
  },

  async logout(): Promise<SessionPayload> {
    const { data } = await http.post<SessionPayload>("/auth/logout/");
    return data;
  },

  async socialProviders(): Promise<{ providers: SocialProviderInfo[] }> {
    const { data } = await http.get<{ providers: SocialProviderInfo[] }>("/auth/social/providers/");
    return data;
  },

  startSocialLogin(provider: SocialProvider, next?: string) {
    const query = next ? `?next=${encodeURIComponent(next)}` : "";
    window.location.href = `${apiBaseURL}/auth/social/${encodeURIComponent(provider)}/start/${query}`;
  },
};

export const accountApi = {
  async currentUser(): Promise<CurrentUser> {
    const { data } = await http.get<CurrentUser>("/account/user/");
    return data;
  },

  async profile(): Promise<UserProfile> {
    const { data } = await http.get<UserProfile>("/account/profile/");
    return data;
  },

  async access(): Promise<PaginatedResponse<unknown>> {
    const { data } = await http.get<PaginatedResponse<unknown>>("/account/access/");
    return data;
  },

  async usageStats(): Promise<Record<string, unknown>> {
    const { data } = await http.get<Record<string, unknown>>("/account/usage/stats/");
    return data;
  },

  async subscription(): Promise<{ subscription: UserSubscription | null }> {
    const { data } = await http.get<{ subscription: UserSubscription | null }>("/account/subscription/");
    return data;
  },

  async createSubscriptionCheckout(planId: number): Promise<SubscriptionCheckoutResponse> {
    const { data } = await http.post<SubscriptionCheckoutResponse>("/account/subscription/", { plan_id: planId });
    return data;
  },

  async getSubscriptionCheckout(checkoutId: number): Promise<{ checkout: SubscriptionCheckout }> {
    const { data } = await http.get<{ checkout: SubscriptionCheckout }>(
      `/account/subscription/checkout/${encodeURIComponent(checkoutId)}/`,
    );
    return data;
  },

  async cancelSubscriptionCheckout(checkoutId: number): Promise<SubscriptionCheckoutResponse> {
    const { data } = await http.delete<SubscriptionCheckoutResponse>(
      `/account/subscription/checkout/${encodeURIComponent(checkoutId)}/`,
    );
    return data;
  },

  async confirmSubscriptionCheckout(checkoutId: number): Promise<SubscriptionConfirmResponse> {
    const { data } = await http.post<SubscriptionConfirmResponse>(
      `/account/subscription/checkout/${encodeURIComponent(checkoutId)}/confirm/`,
    );
    return data;
  },
};
