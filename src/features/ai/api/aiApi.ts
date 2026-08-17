import { apiClient } from "@/lib/axios";
import { GenerateItineraryPayload, AiItineraryResponse, AiCustomerInsights } from "../types";

export interface AiOverviewMetrics {
  totalConversations: number;
  activeConversations: number;
  handedOffConversations: number;
  qualifiedLeads: number;
  publishedKnowledgeArticles: number;
  configuredApiKeysCount?: number;
  healthyApiKeysCount?: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ApiKeyPoolEntry {
  id: string;
  provider: string;
  model: string;
  baseUrl?: string;
  label?: string;
  priority: number;
  isActive: boolean;
  failCount: number;
  lastStatus: 'HEALTHY' | 'RATE_LIMITED' | 'FAILED' | 'UNTESTED';
  lastLatencyMs?: number;
  lastTestedAt?: string;
  lastUsedAt?: string;
  maskedKey: string;
  hasKey: boolean;
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
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: any[];
}

export interface MultiLangTranslations {
  ar: { title: string; content: string };
  en: { title: string; content: string };
  es: { title: string; content: string };
  pt: { title: string; content: string };
  it: { title: string; content: string };
}

export interface AiSafetyEventItem {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  isSuccess: boolean;
  errorCategory?: string;
  sessionId?: string;
  conversationId?: string;
  endpoint: string;
  createdAt: string;
}

export interface PromptVersionItem {
  id: string;
  versionNumber: number;
  name: string;
  systemPrompt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  changeNote?: string;
  createdById?: string;
  publishedById?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  id: string;
  conversationId: string;
  messageId?: string;
  rating: number;
  category?: string;
  comments?: string;
  locale: string;
  createdAt: string;
  conversation?: {
    publicSessionId: string;
    visitorName?: string;
    locale: string;
  };
}

export interface AiAnalyticsData {
  summary: {
    totalConversations: number;
    activeCount: number;
    handedOffCount: number;
    closedCount: number;
    qualifiedLeadsCount: number;
    conversionRate: number;
    handoffRate: number;
    satisfactionRate: number;
    avgLatencyMs: number;
    totalTokens: number;
    totalCostUsd: number;
  };
  providerBreakdown: Array<{
    provider: string;
    model: string;
    requestCount: number;
    totalTokens: number;
    costUsd: number;
  }>;
  feedbackSummary: {
    total: number;
    positive: number;
    negative: number;
  };
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

  getDetailedAnalytics: async (): Promise<AiAnalyticsData> => {
    const response = await apiClient.get("/admin/ai/analytics");
    return response as any;
  },

  // Configuration & Testing
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

  // Prompt Management
  getPromptVersions: async (): Promise<PromptVersionItem[]> => {
    const response = await apiClient.get("/admin/ai/prompts");
    return response as any;
  },

  createPromptDraft: async (payload: { name: string; systemPrompt: string; changeNote?: string }): Promise<PromptVersionItem> => {
    const response = await apiClient.post("/admin/ai/prompts", payload);
    return response as any;
  },

  publishPromptVersion: async (id: string): Promise<{ success: boolean; version: PromptVersionItem }> => {
    const response = await apiClient.post(`/admin/ai/prompts/${id}/publish`);
    return response as any;
  },

  rollbackPromptVersion: async (id: string): Promise<{ success: boolean; version: PromptVersionItem }> => {
    const response = await apiClient.post(`/admin/ai/prompts/${id}/rollback`);
    return response as any;
  },

  // Feedback
  getFeedback: async (params?: { page?: number; limit?: number }): Promise<{
    items: FeedbackItem[];
    total: number;
    positiveCount: number;
    negativeCount: number;
    satisfactionRate: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get("/admin/ai/feedback", { params });
    return response as any;
  },

  // Multi-API Key Pool
  getKeyPool: async (): Promise<ApiKeyPoolEntry[]> => {
    const response = await apiClient.get("/admin/ai/keys");
    return response as any;
  },

  addKeyToPool: async (payload: {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl?: string;
    label?: string;
    priority?: number;
    isActive?: boolean;
  }): Promise<ApiKeyPoolEntry> => {
    const response = await apiClient.post("/admin/ai/keys", payload);
    return response as any;
  },

  updateKeyInPool: async (id: string, payload: Partial<ApiKeyPoolEntry> & { apiKey?: string }): Promise<ApiKeyPoolEntry> => {
    const response = await apiClient.put(`/admin/ai/keys/${id}`, payload);
    return response as any;
  },

  deleteKeyFromPool: async (id: string): Promise<{ success: boolean; id: string }> => {
    const response = await apiClient.delete(`/admin/ai/keys/${id}`);
    return response as any;
  },

  testKeyInPool: async (id: string): Promise<{ success: boolean; latencyMs?: number; message?: string; error?: string }> => {
    const response = await apiClient.post(`/admin/ai/keys/${id}/test`);
    return response as any;
  },

  // 5-Language RAG Auto-Generator
  autoTranslateKnowledge: async (payload: {
    title: string;
    content: string;
    sourceLocale?: string;
    category?: string;
  }): Promise<{ success: boolean; translations: MultiLangTranslations }> => {
    const response = await apiClient.post("/admin/ai/knowledge/auto-translate", payload);
    return response as any;
  },

  saveBatchMultiLangKnowledge: async (payload: {
    articles: Array<{
      title: string;
      content: string;
      locale: string;
      category?: string;
      priority?: number;
      tags?: string[];
    }>;
  }): Promise<{ success: boolean; savedCount: number; items: KnowledgeItemData[] }> => {
    const response = await apiClient.post("/admin/ai/knowledge/batch-multi-lang", payload);
    return response as any;
  },

  // Conversations & Live Human Takeover
  getConversations: async (params?: { page?: number; limit?: number; status?: string; leadStatus?: string; search?: string }): Promise<{ items: ConversationItemData[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get("/admin/ai/conversations", { params });
    return response as any;
  },

  getConversationDetail: async (id: string): Promise<ConversationItemData> => {
    const response = await apiClient.get(`/admin/ai/conversations/${id}`);
    return response as any;
  },

  takeoverConversation: async (id: string): Promise<{ success: boolean; conversation: ConversationItemData }> => {
    const response = await apiClient.post(`/admin/ai/conversations/${id}/takeover`);
    return response as any;
  },

  staffReply: async (id: string, text: string): Promise<{ success: boolean; message: any }> => {
    const response = await apiClient.post(`/admin/ai/conversations/${id}/reply`, { text });
    return response as any;
  },

  returnToAi: async (id: string): Promise<{ success: boolean; status: string }> => {
    const response = await apiClient.post(`/admin/ai/conversations/${id}/return-to-ai`);
    return response as any;
  },

  resolveConversation: async (id: string): Promise<{ success: boolean; status: string }> => {
    const response = await apiClient.post(`/admin/ai/conversations/${id}/resolve`);
    return response as any;
  },

  // Security & Safety Events
  getSafetyEvents: async (params?: { page?: number; limit?: number }): Promise<{ events: AiSafetyEventItem[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get("/admin/ai/safety-events", { params });
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

  uploadKnowledgeDocument: async (payload: { title: string; content: string; category?: string; locale?: string; tags?: string[] }): Promise<{ success: boolean; item: KnowledgeItemData }> => {
    const response = await apiClient.post("/admin/ai/knowledge/upload", payload);
    return response as any;
  },
};
