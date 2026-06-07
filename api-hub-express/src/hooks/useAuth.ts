import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, authApi, type LoginInput, type RegisterInput, type SessionPayload } from "@/lib/api-client";

export const authKeys = {
  session: ["auth", "session"] as const,
  profile: ["account", "profile"] as const,
  access: ["account", "access"] as const,
  usageStats: ["account", "usageStats"] as const,
  subscription: ["account", "subscription"] as const,
};

const anonymousSession: SessionPayload = {
  authenticated: false,
  user: null,
  profile: null,
};

export function useSession() {
  const query = useQuery({
    queryKey: authKeys.session,
    queryFn: authApi.session,
    retry: false,
  });

  return {
    ...query,
    session: query.data ?? anonymousSession,
    user: query.data?.user ?? null,
    profile: query.data?.profile ?? null,
    isAuthenticated: Boolean(query.data?.authenticated),
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
      queryClient.removeQueries({ queryKey: ["account"] });
    },
  });
}

export function useAccountDashboard(enabled: boolean) {
  const profile = useQuery({
    queryKey: authKeys.profile,
    queryFn: accountApi.profile,
    enabled,
  });
  const access = useQuery({
    queryKey: authKeys.access,
    queryFn: accountApi.access,
    enabled,
  });
  const usageStats = useQuery({
    queryKey: authKeys.usageStats,
    queryFn: accountApi.usageStats,
    enabled,
  });
  const subscription = useQuery({
    queryKey: authKeys.subscription,
    queryFn: accountApi.subscription,
    enabled,
  });

  return { profile, access, usageStats, subscription };
}
