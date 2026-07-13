import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "../api/agentsApi";
import { AgentQueryFilters, CreateAgentPayload, UpdateAgentPayload } from "../types";
import { toast } from "sonner";

export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (filters: AgentQueryFilters) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

export function useAgents(filters: AgentQueryFilters) {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: () => agentsApi.getAgents(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAgent(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getAgentById(id),
    enabled: options?.enabled,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentPayload) => agentsApi.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success("Agent created successfully.");
    },
    onError: () => toast.error("Failed to create agent."),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentPayload }) => agentsApi.updateAgent(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success("Agent updated successfully.");
    },
    onError: () => toast.error("Failed to update agent."),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentsApi.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success("Agent deleted successfully.");
    },
    onError: () => toast.error("Failed to delete agent."),
  });
}
