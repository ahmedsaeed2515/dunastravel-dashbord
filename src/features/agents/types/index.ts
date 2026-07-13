export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'AGENT';
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
}

export interface CreateAgentPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  companyId?: string;
}

export interface UpdateAgentPayload {
  name?: string;
  phone?: string;
  companyId?: string;
}
