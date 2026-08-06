import { apiClient } from "@/lib/axios";
import { GenerateItineraryPayload, AiItineraryResponse, AiCustomerInsights } from "../types";

export interface AiOverviewMetrics {
  totalConversations: number;
  activeConversations: number;
  handedOffConversations: number;
  qualifiedLeads: number;
  publishedKnowledgeArticles: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AiConfigData {
  id: string;
  provider: string;
  model: string;
  isEnabled: boolean;
  isPublicEnabled: boolean;
  apiKey?: string;
  encryptedApiKey?: string | null;
  temperature: number;
  maxTokens: number;
  requestTimeoutMs: number;
  systemInstructions: string;
  salesPersonality?: string;
  toneOfVoice?: string;
  fallbackMessage: string;
  escalationMessage: string;
  welcomeMessages?: Record<string, string>;
  suggestedQuestions?: Record<string, string[]>;
}

export interface KnowledgeItemData {
  id: string;
  title: string;
  content: string;
  locale: string;
  category: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  source?: string;
  priority: number;
  updatedAt: string;
}

export interface ConversationItemData {
  id: string;
  publicSessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorNationality?: string;
  locale: string;
  status: 'ACTIVE' | 'HANDED_OFF' | 'CLOSED' | 'ARCHIVED';
  leadStatus: 'NEW' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';
  leadScore: number;
  createdAt: string;
  updatedAt: string;
  messages?: any[];
}

export const aiApi = {
  // Legacy
  generateItinerary: async (payload: GenerateItineraryPayload): Promise<AiItineraryResponse> => {
    const response = await apiClient.post("/admin/ai/itinerary/generate", payload);
    return response as any;
  },

  analyzeCustomer: async (customerId: string): Promise<AiCustomerInsights> => {
    const response = await apiClient.post(`/admin/ai/customer/${customerId}/analyze`);
    return response as any;
  },

  // Overview & Analytics
  getOverview: async (): Promise<{ metrics: AiOverviewMetrics }> => {
    const response = await apiClient.get("/admin/ai/overview");
    return response as any;
  },

  // Configuration & Provider Testing
  getConfig: async (): Promise<AiConfigData> => {
    const response = await apiClient.get("/admin/ai/config");
    return response as any;
  },

  updateConfig: async (payload: Partial<AiConfigData>): Promise<AiConfigData> => {
    const response = await apiClient.put("/admin/ai/config", payload);
    return response as any;
  },

  testConnection: async (payload: { provider?: string; model?: string; apiKey?: string }): Promise<any> => {
    const response = await apiClient.post("/admin/ai/config/test", payload);
    return response as any;
  },

  // Conversations
  getConversations: async (params?: { page?: number; limit?: number; status?: string; leadStatus?: string; search?: string }): Promise<{ items: ConversationItemData[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get("/admin/ai/conversations", { params });
    return response as any;
  },

  getConversationDetail: async (id: string): Promise<ConversationItemData> => {
    const response = await apiClient.get(`/admin/ai/conversations/${id}`);
    return response as any;
  },

  // Testing Playground Simulator
  runSimulator: async (payload: { message: string; sessionId: string; locale?: string }): Promise<any> => {
    const response = await apiClient.post("/admin/ai/simulator", payload);
    return response as any;
  },

  // Knowledge Base CRUD
  getKnowledge: async (params?: { page?: number; limit?: number; category?: string; locale?: string; status?: string; search?: string }): Promise<{ items: KnowledgeItemData[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get("/admin/ai/knowledge", { params });
    return response as any;
  },

  createKnowledge: async (payload: Partial<KnowledgeItemData>): Promise<KnowledgeItemData> => {
    const response = await apiClient.post("/admin/ai/knowledge", payload);
    return response as any;
  },

  updateKnowledge: async (id: string, payload: Partial<KnowledgeItemData>): Promise<KnowledgeItemData> => {
    const response = await apiClient.put(`/admin/ai/knowledge/${id}`, payload);
    return response as any;
  },

  deleteKnowledge: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/admin/ai/knowledge/${id}`);
    return response as any;
  },

  reindexKnowledge: async (): Promise<{ success: boolean; reindexedCount: number }> => {
    const response = await apiClient.post("/admin/ai/knowledge/index");
    return response as any;
  },

  syncCatalogKnowledge: async (): Promise<{ success: boolean; syncedTours: number; syncedDestinations: number }> => {
    const response = await apiClient.post("/admin/ai/knowledge/sync-catalog");
    return response as any;
  },
};
