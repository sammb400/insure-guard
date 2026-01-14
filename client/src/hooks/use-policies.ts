import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PolicyInput } from "@shared/routes";

export function usePolicies() {
  return useQuery({
    queryKey: [api.policies.list.path],
    queryFn: async () => {
      const res = await fetch(api.policies.list.path);
      if (!res.ok) throw new Error("Failed to fetch policies");
      return api.policies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PolicyInput) => {
      const res = await fetch(api.policies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.policies.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create policy");
      }
      return api.policies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.policies.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
