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
    const { data } = await apiClient.get("/admin/agents", { params: filters });
    return data;
  },

  getAgentById: async (id: string): Promise<Agent> => {
    const { data } = await apiClient.get(`/admin/agents/${id}`);
    return data;
  },

  createAgent: async (payload: CreateAgentPayload): Promise<Agent> => {
    const { data } = await apiClient.post("/admin/agents", payload);
    return data;
  },

  updateAgent: async (id: string, payload: UpdateAgentPayload): Promise<Agent> => {
    const { data } = await apiClient.patch(`/admin/agents/${id}`, payload);
    return data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/agents/${id}`);
  }
};
