import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, type StudioFlowDeployInput } from "@/lib/api-client";
import { authKeys } from "@/hooks/useAuth";
import { usageKeys } from "@/hooks/useUsage";

export const studioKeys = {
  all: ["account", "studio"] as const,
  flows: ["account", "studio", "flows"] as const,
};

export function useStudioFlows(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.flows,
    queryFn: accountApi.studioFlows,
    enabled,
  });
}

export function useDeployStudioFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudioFlowDeployInput) => accountApi.deployStudioFlow(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.all });
      queryClient.invalidateQueries({ queryKey: usageKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.usageStats });
    },
  });
}
