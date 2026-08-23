import { apiClient } from "@/lib/axios";
import { 
  Agent,
  AgentQueryFilters,
  CreateAgentPayload,
  UpdateAgentPayload
} from "../types";
import { requirePaginated } from "@/lib/api-response";

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
    const response = await apiClient.get("/admin/agents", { params: filters });
    return requirePaginated(response, "agents");
  },

  getAgentById: async (id: string): Promise<Agent> => {
    const response = await apiClient.get(`/admin/agents/${id}`);
    return response as any;
  },

  createAgent: async (payload: CreateAgentPayload): Promise<Agent> => {
    const response = await apiClient.post("/admin/agents", payload);
    return response as any;
  },

  updateAgent: async (id: string, payload: UpdateAgentPayload): Promise<Agent> => {
    const response = await apiClient.patch(`/admin/agents/${id}`, payload);
    return response as any;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/agents/${id}`);
  }
};
