import { apiClient } from "@/lib/axios";
import { 
  Agent,
  AgentQueryFilters,
  CreateAgentPayload,
  UpdateAgentPayload
} from "../types";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const agentsApi = {
  getAgents: async (filters: AgentQueryFilters = {}): Promise<PaginatedResponse<Agent>> => {
    return apiClient.get<PaginatedResponse<Agent>, PaginatedResponse<Agent>>("/admin/agents", { params: filters });
  },

  getAgentById: async (id: string): Promise<Agent> => {
    return apiClient.get<Agent, Agent>(`/admin/agents/${id}`);
  },

  createAgent: async (payload: CreateAgentPayload): Promise<Agent> => {
    return apiClient.post<Agent, Agent>("/admin/agents", payload);
  },

  updateAgent: async (id: string, payload: UpdateAgentPayload): Promise<Agent> => {
    return apiClient.patch<Agent, Agent>(`/admin/agents/${id}`, payload);
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/agents/${id}`);
  }
};
