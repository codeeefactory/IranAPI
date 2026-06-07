import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, type CallerExecuteInput, type UsageListParams } from "@/lib/api-client";
import { authKeys } from "@/hooks/useAuth";

export const usageKeys = {
  all: ["account", "usage"] as const,
  list: (params?: UsageListParams) => [...usageKeys.all, params ?? {}] as const,
};

export function useUsageHistory(params?: UsageListParams, enabled = true) {
  return useQuery({
    queryKey: usageKeys.list(params),
    queryFn: () => accountApi.usage(params),
    enabled,
  });
}

export function useCallerExecute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CallerExecuteInput) => accountApi.executeCaller(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usageKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.usageStats });
    },
  });
}
