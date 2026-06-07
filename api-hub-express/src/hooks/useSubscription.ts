import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, catalogApi, type SubscriptionPlan } from "@/lib/api-client";

export const subscriptionKeys = {
  plans: ["catalog", "subscriptionPlans"] as const,
  current: ["account", "subscription"] as const,
  checkout: (id?: number | null) => ["account", "subscriptionCheckout", id ?? ""] as const,
};

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: 0,
    name: "starter",
    slug: "starter",
    description: "// for prototypes & weekend hacks",
    plan_type: "starter",
    price: "0",
    currency: "IRR",
    interval: "month",
    interval_days: 30,
    included_requests: 25000,
    api_publish_limit: 1,
    features: ["25k calls / mo", "1 project", "shared edge pool"],
    is_popular: false,
    is_active: true,
  },
  {
    id: 0,
    name: "growth",
    slug: "growth",
    description: "// for product teams shipping daily",
    plan_type: "growth",
    price: "1490000",
    currency: "IRR",
    interval: "month",
    interval_days: 30,
    included_requests: 250000,
    api_publish_limit: 10,
    features: ["250k calls / mo", "10 projects", "priority webhooks", "team rbac"],
    is_popular: true,
    is_active: true,
  },
  {
    id: 0,
    name: "enterprise",
    slug: "enterprise",
    description: "// dedicated infra, vpc peering, on-prem",
    plan_type: "enterprise",
    price: "0",
    currency: "IRR",
    interval: "month",
    interval_days: 30,
    included_requests: 1000000,
    api_publish_limit: null,
    features: ["custom call volume", "dedicated edge cluster", "99.99% sla", "named sre on-call"],
    is_popular: false,
    is_active: true,
  },
];

export function useSubscriptionPlans() {
  const query = useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: catalogApi.listSubscriptionPlans,
  });

  const plans = useMemo(() => query.data?.results ?? FALLBACK_PLANS, [query.data]);
  return { ...query, plans, isFallback: !query.data };
}

export function useCurrentSubscription(enabled: boolean) {
  return useQuery({
    queryKey: subscriptionKeys.current,
    queryFn: accountApi.subscription,
    enabled,
  });
}

export function useSubscriptionCheckout(checkoutId?: number | null) {
  return useQuery({
    queryKey: subscriptionKeys.checkout(checkoutId),
    queryFn: () => accountApi.getSubscriptionCheckout(checkoutId as number),
    enabled: Boolean(checkoutId),
  });
}

export function useCreateSubscriptionCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: number) => accountApi.createSubscriptionCheckout(planId),
    onSuccess: (data) => {
      queryClient.setQueryData(subscriptionKeys.checkout(data.checkout.id), { checkout: data.checkout });
    },
  });
}

export function useCancelSubscriptionCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkoutId: number) => accountApi.cancelSubscriptionCheckout(checkoutId),
    onSuccess: (data) => {
      queryClient.setQueryData(subscriptionKeys.checkout(data.checkout.id), { checkout: data.checkout });
    },
  });
}

export function useConfirmSubscriptionCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkoutId: number) => accountApi.confirmSubscriptionCheckout(checkoutId),
    onSuccess: (data) => {
      queryClient.setQueryData(subscriptionKeys.checkout(data.checkout.id), { checkout: data.checkout });
      queryClient.setQueryData(subscriptionKeys.current, { subscription: data.subscription });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}
