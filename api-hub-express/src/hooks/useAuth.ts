import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  accountApi,
  authApi,
  type AccountProfileUpdateInput,
  type LoginInput,
  type OrganizationCreateInput,
  type RegisterInput,
  type SessionPayload,
} from "@/lib/api-client";

export const authKeys = {
  session: ["auth", "session"] as const,
  profile: ["account", "profile"] as const,
  access: ["account", "access"] as const,
  organizations: ["account", "organizations"] as const,
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

export function useUpdateAccountProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AccountProfileUpdateInput) => {
      const [userResponse, profileResponse] = await Promise.all([
        accountApi.updateUser({
          email: input.email,
          first_name: input.first_name,
          last_name: input.last_name,
        }),
        accountApi.updateProfile({
          phone: input.phone,
          company: input.company,
          bio: input.bio,
          avatar: input.avatar,
        }),
      ]);
      return { user: userResponse.user, profile: profileResponse.profile };
    },
    onSuccess: ({ user, profile }) => {
      queryClient.setQueryData<SessionPayload | undefined>(authKeys.session, (current) =>
        current ? { ...current, user, profile, authenticated: true } : current,
      );
      queryClient.setQueryData(authKeys.profile, profile);
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}

export function useOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: authKeys.organizations,
    queryFn: accountApi.organizations,
    enabled,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationCreateInput) => accountApi.createOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.organizations });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}
