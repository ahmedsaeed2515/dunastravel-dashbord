import { apiClient } from "@/lib/axios";
import { GenerateItineraryPayload, AiItineraryResponse, AiCustomerInsights } from "../types";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export interface MutationAcknowledgement { success: boolean; message?: string; id?: string; }

/** Response returned by the public chat orchestrator and the admin simulator. */
export interface AiSimulatorResponse {
  conversationId: string;
  message: {
    id: string;
    role: string;
    content: string;
    structuredContent?: JsonValue;
    createdAt: string;
  };
  recommendations: {
    tours: JsonValue[];
    destinations: JsonValue[];
    proposal?: JsonValue | null;
    comparison?: JsonValue | null;
  };
  suggestedReplies: string[];
  actions: JsonValue[];
  handoff: JsonValue;
  leadCapture: JsonValue;
  sources: JsonValue[];
  telemetry?: JsonValue;
}

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
  messages?: JsonValue[];
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
    return apiClient.post<unknown, AiItineraryResponse>("/admin/ai/itinerary/generate", payload);
  },

  analyzeCustomer: async (customerId: string): Promise<AiCustomerInsights> => {
    return apiClient.post<unknown, AiCustomerInsights>(`/admin/ai/customer/${customerId}/analyze`);
  },

  // Overview & Analytics
  getOverview: async (): Promise<{ metrics: AiOverviewMetrics }> => {
    return apiClient.get<unknown, { metrics: AiOverviewMetrics }>("/admin/ai/overview");
  },

  getDetailedAnalytics: async (): Promise<AiAnalyticsData> => {
    return apiClient.get<unknown, AiAnalyticsData>("/admin/ai/analytics");
  },

  // Configuration & Testing
  getConfig: async (): Promise<AiConfigData> => {
    return apiClient.get<unknown, AiConfigData>("/admin/ai/config");
  },

  updateConfig: async (payload: Partial<AiConfigData>): Promise<AiConfigData> => {
    return apiClient.put<unknown, AiConfigData>("/admin/ai/config", payload);
  },

  testConnection: (payload: { provider?: string; model?: string; apiKey?: string }): Promise<MutationAcknowledgement & { provider?: string; model?: string; latencyMs?: number; error?: string }> => {
    return apiClient.post<unknown, MutationAcknowledgement & { provider?: string; model?: string; latencyMs?: number; error?: string }>("/admin/ai/config/test", payload);
  },

  // Prompt Management
  getPromptVersions: async (): Promise<PromptVersionItem[]> => {
    return apiClient.get<unknown, PromptVersionItem[]>("/admin/ai/prompts");
  },

  seedDefaultPrompts: async (): Promise<PromptVersionItem[]> => {
    return apiClient.post<unknown, PromptVersionItem[]>("/admin/ai/prompts/seed-defaults");
  },

  createPromptDraft: async (payload: { name: string; systemPrompt: string; changeNote?: string }): Promise<PromptVersionItem> => {
    return apiClient.post<unknown, PromptVersionItem>("/admin/ai/prompts", payload);
  },

  updatePromptVersion: async (id: string, payload: { name?: string; systemPrompt?: string; changeNote?: string; status?: string }): Promise<PromptVersionItem> => {
    return apiClient.put<unknown, PromptVersionItem>(`/admin/ai/prompts/${id}`, payload);
  },

  deletePromptVersion: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<unknown, { success: boolean; id: string }>(`/admin/ai/prompts/${id}`);
  },

  archivePromptVersion: async (id: string): Promise<PromptVersionItem> => {
    return apiClient.post<unknown, PromptVersionItem>(`/admin/ai/prompts/${id}/archive`);
  },

  publishPromptVersion: async (id: string): Promise<{ success: boolean; version: PromptVersionItem }> => {
    return apiClient.post<unknown, { success: boolean; version: PromptVersionItem }>(`/admin/ai/prompts/${id}/publish`);
  },

  rollbackPromptVersion: async (id: string): Promise<{ success: boolean; version: PromptVersionItem }> => {
    return apiClient.post<unknown, { success: boolean; version: PromptVersionItem }>(`/admin/ai/prompts/${id}/rollback`);
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
    return apiClient.get<unknown, {
      items: FeedbackItem[]; total: number; positiveCount: number; negativeCount: number; satisfactionRate: number; page: number; totalPages: number;
    }>("/admin/ai/feedback", { params });
  },

  // Multi-API Key Pool
  getKeyPool: async (): Promise<ApiKeyPoolEntry[]> => {
    return apiClient.get<unknown, ApiKeyPoolEntry[]>("/admin/ai/keys");
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
    return apiClient.post<unknown, ApiKeyPoolEntry>("/admin/ai/keys", payload);
  },

  updateKeyInPool: async (id: string, payload: Partial<ApiKeyPoolEntry> & { apiKey?: string }): Promise<ApiKeyPoolEntry> => {
    return apiClient.put<unknown, ApiKeyPoolEntry>(`/admin/ai/keys/${id}`, payload);
  },

  reorderKeysInPool: async (orderedIds: string[]): Promise<ApiKeyPoolEntry[]> => {
    return apiClient.put<unknown, ApiKeyPoolEntry[]>("/admin/ai/keys/reorder", { orderedIds });
  },

  deleteKeyFromPool: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<unknown, { success: boolean; id: string }>(`/admin/ai/keys/${id}`);
  },

  testKeyInPool: async (id: string): Promise<{ success: boolean; latencyMs?: number; message?: string; error?: string }> => {
    return apiClient.post<unknown, { success: boolean; latencyMs?: number; message?: string; error?: string }>(`/admin/ai/keys/${id}/test`);
  },

  // 5-Language RAG Auto-Generator
  autoTranslateKnowledge: async (payload: {
    title: string;
    content: string;
    sourceLocale?: string;
    category?: string;
  }): Promise<{ success: boolean; translations: MultiLangTranslations }> => {
    return apiClient.post<unknown, { success: boolean; translations: MultiLangTranslations }>("/admin/ai/knowledge/auto-translate", payload);
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
    return apiClient.post<unknown, { success: boolean; savedCount: number; items: KnowledgeItemData[] }>("/admin/ai/knowledge/batch-multi-lang", payload);
  },

  // Conversations & Live Human Takeover
  getConversations: async (params?: { page?: number; limit?: number; status?: string; leadStatus?: string; search?: string }): Promise<{ items: ConversationItemData[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { items: ConversationItemData[]; total: number; page: number; totalPages: number }>("/admin/ai/conversations", { params });
  },

  getConversationDetail: async (id: string): Promise<ConversationItemData> => {
    return apiClient.get<unknown, ConversationItemData>(`/admin/ai/conversations/${id}`);
  },

  takeoverConversation: async (id: string): Promise<{ success: boolean; conversation: ConversationItemData }> => {
    return apiClient.post<unknown, { success: boolean; conversation: ConversationItemData }>(`/admin/ai/conversations/${id}/takeover`);
  },

  staffReply: (id: string, text: string): Promise<{ success: boolean; message: JsonValue }> => {
    return apiClient.post<unknown, { success: boolean; message: JsonValue }>(`/admin/ai/conversations/${id}/reply`, { text });
  },

  returnToAi: async (id: string): Promise<{ success: boolean; status: string }> => {
    return apiClient.post<unknown, { success: boolean; status: string }>(`/admin/ai/conversations/${id}/return-to-ai`);
  },

  resolveConversation: async (id: string): Promise<{ success: boolean; status: string }> => {
    return apiClient.post<unknown, { success: boolean; status: string }>(`/admin/ai/conversations/${id}/resolve`);
  },

  // Security & Safety Events
  getSafetyEvents: async (params?: { page?: number; limit?: number }): Promise<{ events: AiSafetyEventItem[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { events: AiSafetyEventItem[]; total: number; page: number; totalPages: number }>("/admin/ai/safety-events", { params });
  },

  // Testing Playground Simulator
  runSimulator: (payload: { message: string; sessionId: string; locale?: string }): Promise<AiSimulatorResponse> => {
    return apiClient.post<unknown, AiSimulatorResponse>("/admin/ai/simulator", payload);
  },

  // Knowledge Base CRUD
  getKnowledge: async (params?: { page?: number; limit?: number; category?: string; locale?: string; status?: string; search?: string }): Promise<{ items: KnowledgeItemData[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { items: KnowledgeItemData[]; total: number; page: number; totalPages: number }>("/admin/ai/knowledge", { params });
  },

  createKnowledge: async (payload: Partial<KnowledgeItemData>): Promise<KnowledgeItemData> => {
    return apiClient.post<unknown, KnowledgeItemData>("/admin/ai/knowledge", payload);
  },

  updateKnowledge: async (id: string, payload: Partial<KnowledgeItemData>): Promise<KnowledgeItemData> => {
    return apiClient.put<unknown, KnowledgeItemData>(`/admin/ai/knowledge/${id}`, payload);
  },

  deleteKnowledge: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<unknown, { success: boolean }>(`/admin/ai/knowledge/${id}`);
  },

  reindexKnowledge: async (): Promise<{ success: boolean; reindexedCount: number }> => {
    return apiClient.post<unknown, { success: boolean; reindexedCount: number }>("/admin/ai/knowledge/index");
  },

  syncCatalogKnowledge: async (): Promise<{ success: boolean; syncedTours: number; syncedDestinations: number }> => {
    return apiClient.post<unknown, { success: boolean; syncedTours: number; syncedDestinations: number }>("/admin/ai/knowledge/sync-catalog");
  },

  uploadKnowledgeDocument: async (payload: { title: string; content: string; category?: string; locale?: string; tags?: string[] }): Promise<{ success: boolean; item: KnowledgeItemData }> => {
    return apiClient.post<unknown, { success: boolean; item: KnowledgeItemData }>("/admin/ai/knowledge/upload", payload);
  },
};
