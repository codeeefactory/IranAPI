import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, type ApiProjectInitInput, type CallerExecuteInput, type UsageListParams } from "@/lib/api-client";
import { authKeys } from "@/hooks/useAuth";

export const usageKeys = {
  all: ["account", "usage"] as const,
  list: (params?: UsageListParams) => [...usageKeys.all, params ?? {}] as const,
  projectInit: ["account", "project-init"] as const,
  projectDeployments: ["account", "project-deployments"] as const,
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

export function useProjectInitCatalog(enabled = true) {
  return useQuery({
    queryKey: usageKeys.projectInit,
    queryFn: accountApi.projectInitCatalog,
    enabled,
  });
}

export function useInitializeProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApiProjectInitInput) => accountApi.initializeProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usageKeys.projectInit });
    },
  });
}

export function useAnalyzeProject() {
  return useMutation({ mutationFn: (archive: File) => accountApi.analyzeProject(archive) });
}

export function useProjectDeployments(enabled = true) {
  return useQuery({
    queryKey: usageKeys.projectDeployments,
    queryFn: accountApi.projectDeployments,
    enabled,
    refetchInterval: 3000,
  });
}

export function useDeployProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ archive, projectName, region }: { archive: File; projectName: string; region: string }) =>
      accountApi.deployProject(archive, projectName, region),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usageKeys.projectDeployments }),
  });
}
