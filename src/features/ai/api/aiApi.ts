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

export interface GuiderAvailabilityInfo {
  enabled: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE';
  message: string;
  changedAt?: string;
  changedBy?: string;
  reason?: string;
}

export interface UpdateGuiderStatusPayload {
  status: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE';
  disabledMessage?: string;
  reason?: string;
}

export interface AiOverviewMetrics {
  totalConversations: number;
  activeConversations: number;
  handedOffConversations: number;
  qualifiedLeads: number;
  publishedKnowledgeArticles: number;
  configuredApiKeysCount?: number;
  healthyApiKeysCount?: number;
  verifiedHealthyApiKeysCount?: number;
  guiderStatus?: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE';
  guiderAvailability?: GuiderAvailabilityInfo;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ApiKeyPoolEntry {
  id: string;
  provider: string;
  defaultModel?: string;
  model: string;
  enabledModels?: string[];
  baseUrl?: string;
  label?: string;
  priority: number;
  isActive: boolean;
  failCount: number;
  lastStatus: 'HEALTHY' | 'RATE_LIMITED' | 'FAILED' | 'UNTESTED' | 'INVALID_CREDENTIAL' | 'CONFIGURATION_ERROR';
  lastLatencyMs?: number;
  lastTestedAt?: string;
  lastUsedAt?: string;
  maskedKey: string;
  hasKey: boolean;
}

export interface ProviderTestResult {
  success: boolean;
  code: 'SUCCESS' | 'INVALID_KEY' | 'UNAUTHORIZED' | 'MODEL_NOT_FOUND' | 'RATE_LIMITED' | 'PROVIDER_DOWN' | 'INVALID_CONFIGURATION' | 'TIMEOUT' | 'UNKNOWN_ERROR';
  provider: string;
  model: string;
  latencyMs?: number;
  message?: string;
  error?: string;
  diagnosis?: string;
}

export interface ProviderRegistryItem {
  id: string;
  name: string;
  displayName?: string;
  defaultBaseUrl: string;
  defaultModel: string;
  models: string[];
  isLegacy?: boolean;
  isRecommended?: boolean;
  apiKeyUrl?: string;
  setupInstructions?: string[];
  allowCustomBaseUrl?: boolean;
}

export interface DiscoveredModelItem {
  id: string;
  displayName: string;
  provider: string;
  supportsChat: boolean;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsStructuredOutput: boolean;
  contextWindow?: number;
  inputPricePer1M?: number;
  outputPricePer1M?: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'DEPRECATED';
  source: 'LIVE_PROVIDER';
  curatedBadge?: 'BEST_OVERALL' | 'BEST_VALUE' | 'FASTEST' | 'QUALITY' | 'ADVANCED' | null;
  isCurated?: boolean;
}

export interface ActivateModelPayload {
  provider: string;
  model: string;
  credentialId?: string;
  testBeforeActivate?: boolean;
}

export interface KnowledgeSyncStatus {
  isStale: boolean;
  status: 'HEALTHY' | 'STALE' | 'INITIALIZING' | 'FAILED';
  lastSyncedAt?: string | null;
  currentSnapshot?: {
    snapshotVersion: string;
    datasetChecksum: string;
    totalToursIngested: number;
    totalChunksCreated: number;
    activatedAt: string;
  } | null;
  lastSyncJob?: {
    id: string;
    trigger: string;
    status: string;
    snapshotVersion?: string;
    toursCount?: number;
    chunksCount?: number;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
    errorMessage?: string;
  } | null;
  recentJobs?: Array<{
    id: string;
    trigger: string;
    status: string;
    snapshotVersion?: string;
    toursCount?: number;
    chunksCount?: number;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
    errorMessage?: string;
  }>;
  totalItems: number;
  totalChunks: number;
  staleThresholdDays: number;
}

export interface RoutingPolicyData {
  table: Record<'economy' | 'normal' | 'complex' | 'fallback', {
    provider: string;
    model: string;
    displayName?: string;
    providerDisplayName?: string;
  }>;
  agentPolicies: Array<{
    agentSlug: string;
    economy: { provider: string; model: string };
    normal: { provider: string; model: string };
    complex: { provider: string; model: string };
    fallback: { provider: string; model: string };
  }>;
}

export interface AiConfigData {
  id: string;
  provider: string;
  model: string;
  isEnabled: boolean;
  isPublicEnabled: boolean;
  isInChatBookingEnabled?: boolean;
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

export interface CanonicalKnowledgeEntity {
  canonicalEntityId: string;
  sourceEntityType: 'TOUR' | 'HOTEL' | 'TRANSPORTATION' | 'DESTINATION' | 'POLICY' | 'FAQ' | 'MANUAL';
  sourceType: 'SOURCE_MANAGED' | 'MANUALLY_MANAGED';
  sourceEntityId: string;
  title: string;
  category: string;
  syncStatus: 'SYNCED' | 'OUTDATED' | 'SYNCING' | 'FAILED' | 'SOURCE_DELETED';
  isExcludedFromAi: boolean;
  isRecommendationAllowed: boolean;
  aiOverrideInstructions: string | null;
  aiOverrideContext: string | null;
  adminNotes: string | null;
  isManuallyOverridden: boolean;
  validityStart?: string | null;
  validityEnd?: string | null;
  updatedAt: string;
  languagesCount: number;
  languages: Array<{
    locale: string;
    isComplete: boolean;
    id?: string;
    title?: string;
    isExcludedFromAi: boolean;
    status: string;
  }>;
  locales: Record<string, {
    id: string;
    title: string;
    content: string;
    locale: string;
    status: string;
    isExcludedFromAi: boolean;
    isManuallyOverridden: boolean;
    updatedAt: string;
  }>;
}

export interface AiResponseRuleItem {
  ruleId: string;
  triggerQuestion: string;
  prescribedAnswer: string;
  category: string;
  priority: number;
  isExcludedFromAi: boolean;
  createdAt: string;
  updatedAt: string;
  languagesList: Array<{
    locale: string;
    isComplete: boolean;
    id?: string;
    triggerQuestion?: string;
    prescribedAnswer?: string;
    isExcludedFromAi?: boolean;
  }>;
}

export interface AiKnowledgeVersionItem {
  id: string;
  knowledgeItemId: string;
  versionNumber: number;
  title: string;
  content: string;
  locale: string;
  aiOverrideInstructions?: string | null;
  changeSummary?: string | null;
  changedBy?: string | null;
  createdAt: string;
}

export interface KnowledgeProblemItem {
  id: string;
  type: 'FAILED_SYNC' | 'EXPIRED_OVERRIDE' | 'MISSING_TRANSLATION' | 'SOURCE_DELETED';
  title: string;
  description: string;
  actionText: string;
  actionUrl?: string;
}

export interface KnowledgeProblemsSummary {
  totalIssues: number;
  failedSyncCount: number;
  expiredOverrideCount: number;
  sourceDeletedCount: number;
  missingTranslationCount: number;
  problems: KnowledgeProblemItem[];
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
  sourceType?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  isExcludedFromAi?: boolean;
  isManuallyOverridden?: boolean;
  isRecommendationAllowed?: boolean;
  aiOverrideInstructions?: string | null;
  aiOverrideContext?: string | null;
  adminNotes?: string | null;
  validityStart?: string | null;
  validityEnd?: string | null;
  priority: number;
  syncStatus?: string;
  lastSyncedAt?: string;
  lastIndexedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConversationListItem = ConversationItemData;
export type ConversationDetailData = ConversationItemData;

export interface ConversationItemData {
  id: string;
  publicSessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorNationality?: string;
  locale: string;
  budgetRange?: string;
  tripDuration?: string;
  paxCount?: number;
  travelPreferences?: any;
  status: 'ACTIVE' | 'HANDED_OFF' | 'HUMAN_ACTIVE' | 'RESOLVED' | 'CLOSED' | 'ARCHIVED' | string;
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

export interface AgentItemData {
  id: string;
  slug: string;
  name?: string;
  description?: string;
  nameJsonb: Record<string, string>;
  descriptionJsonb?: Record<string, string>;
  displayName?: string;
  displayDescription?: string;
  role: string;
  avatar?: string;
  systemPrompt?: string;
  personalityGuidelines?: string;
  tone?: string;
  primaryModel: string;
  fallbackModels: string[];
  temperature: number;
  maxTokens: number;
  allowedSources: string[];
  allowedTools: string[];
  supportedLanguages: string[];
  defaultLanguage: string;
  isActive: boolean;
  isPublic: boolean;
  activePromptVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelCapabilityItem {
  id: string;
  provider: string;
  name: string;
  nameAr: string;
  description?: string;
  recommendation?: 'economy' | 'balanced' | 'premium' | 'fallback' | 'experimental';
  badge: 'Flagship' | 'Recommended' | 'Fast' | 'Reasoning' | 'Light' | 'OpenSource' | 'Economy' | 'Balanced' | 'Advanced' | 'Premium' | 'Fallback' | 'Experimental';
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'DEPRECATED' | 'UNKNOWN';
  lastVerifiedAt?: string;
  contextWindow: number;
  maxOutputTokens?: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  cachedInputPricePerMillion?: number;
  supportsStreaming?: boolean;
  supportsToolCalling: boolean;
  supportsStructuredOutput: boolean;
  supportsVision: boolean;
  multilingualRating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD';
  isPopular: boolean;
  isDefault?: boolean;
}

export interface ProviderItem {
  id: string;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  models: string[];
}

export interface KnowledgeChunkItem {
  id: string;
  canonicalEntityId: string;
  entityType: string;
  entityId: string;
  locale: string;
  chunkIndex?: number;
  title: string;
  content: string;
  contentHash?: string;
  metadataJsonb?: JsonValue;
  lastIndexedAt?: string;
}

export interface DiagnosticTraceResponse {
  traceId: string;
  answer: string;
  agent: {
    id: string;
    slug: string;
    name: string;
    role: string;
    avatar?: string;
  };
  model: {
    id: string;
    provider: string;
    info: ModelCapabilityItem;
  };
  retrieval: {
    enabled: boolean;
    latencyMs: number;
    matchedChunks: KnowledgeChunkItem[];
    groundedTours: Array<{
      id: string;
      slug: string;
      title: string;
      country: string;
      city: string;
      category: string;
      durationDays: number;
      basePriceUsd: number;
      currency: string;
      heroImage: string;
      publicUrl: string;
    }>;
    groundedHotels: Array<{
      name: string;
      city: string;
      starRating: number;
      minPriceUsd: number;
    }>;
    groundedTransportation: Array<{
      name: string;
      vehicleType: string;
      priceUsd: number;
    }>;
  };
  prompt: {
    compiledSystemPrompt: string;
    versionId: string;
  };
  telemetry: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    totalLatencyMs: number;
    providerLatencyMs: number;
    providerError?: string;
  };
}

export interface PromptVersionItem {
  id: string;
  versionNumber: number;
  name: string;
  systemPrompt: string;
  agentSlug?: string;
  sections?: Record<string, string>;
  variables?: Record<string, string>;
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

  // Global GuideR Availability Control
  getGuiderStatus: async (): Promise<GuiderAvailabilityInfo> => {
    return apiClient.get<unknown, GuiderAvailabilityInfo>("/ai/chat/status");
  },

  updateGuiderStatus: async (payload: UpdateGuiderStatusPayload): Promise<GuiderAvailabilityInfo> => {
    return apiClient.post<unknown, GuiderAvailabilityInfo>("/admin/ai/status", payload);
  },

  // Configuration & Testing
  getConfig: async (): Promise<AiConfigData> => {
    return apiClient.get<unknown, AiConfigData>("/admin/ai/config");
  },

  updateConfig: async (payload: Partial<AiConfigData>): Promise<AiConfigData> => {
    return apiClient.put<unknown, AiConfigData>("/admin/ai/config", payload);
  },

  testConnection: (payload: { provider?: string; model?: string; apiKey?: string }): Promise<ProviderTestResult> => {
    return apiClient.post<unknown, ProviderTestResult>("/admin/ai/config/test", payload);
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

  testKeyInPool: async (id: string): Promise<ProviderTestResult> => {
    return apiClient.post<unknown, ProviderTestResult>(`/admin/ai/keys/${id}/test`);
  },

  addPoolKey: async (payload: {
    provider: string;
    model?: string;
    apiKey: string;
    baseUrl?: string;
    label?: string;
    priority?: number;
    isActive?: boolean;
  }): Promise<ApiKeyPoolEntry> => {
    return apiClient.post<unknown, ApiKeyPoolEntry>("/admin/ai/keys", payload);
  },

  updatePoolKey: async (id: string, payload: Partial<ApiKeyPoolEntry> & { apiKey?: string }): Promise<ApiKeyPoolEntry> => {
    return apiClient.put<unknown, ApiKeyPoolEntry>(`/admin/ai/keys/${id}`, payload);
  },

  deletePoolKey: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<unknown, { success: boolean; id: string }>(`/admin/ai/keys/${id}`);
  },

  testPoolKey: async (id: string): Promise<ProviderTestResult> => {
    return apiClient.post<unknown, ProviderTestResult>(`/admin/ai/keys/${id}/test`);
  },

  // Provider Registry & Routing Endpoints
  getProviders: async (): Promise<{ providers: ProviderRegistryItem[]; routingTable: any }> => {
    return apiClient.get<unknown, { providers: ProviderRegistryItem[]; routingTable: any }>("/admin/ai/providers");
  },

  getProviderModels: async (providerId: string): Promise<{
    provider: {
      id: string;
      displayName: string;
      officialBaseUrl: string;
      apiKeyUrl: string;
      setupInstructions: string[];
      allowCustomBaseUrl: boolean;
    };
    models: ModelCapabilityItem[];
  }> => {
    return apiClient.get<unknown, any>(`/admin/ai/providers/${providerId}/models`);
  },

  refreshProviderModels: async (
    providerId: string,
    payload?: {
      credentialId?: string;
      apiKey?: string;
      baseUrl?: string;
      integrationMode?: 'openai-compatible' | 'google-native';
      forceRefresh?: boolean;
    },
  ): Promise<{
    providerId: string;
    models: DiscoveredModelItem[];
    curatedModels?: DiscoveredModelItem[];
    rawModels?: DiscoveredModelItem[];
    cached: boolean;
    timestamp: string;
  }> => {
    return apiClient.post<unknown, {
      providerId: string;
      models: DiscoveredModelItem[];
      curatedModels?: DiscoveredModelItem[];
      rawModels?: DiscoveredModelItem[];
      cached: boolean;
      timestamp: string;
    }>(`/admin/ai/providers/${providerId}/models/refresh`, payload || {});
  },

  activateModel: async (payload: ActivateModelPayload): Promise<{
    success: boolean;
    provider: string;
    model: string;
    testResult?: ProviderTestResult;
    updatedCredentialId?: string;
  }> => {
    return apiClient.post<unknown, any>("/admin/ai/models/activate", payload);
  },

  getKnowledgeStatus: async (): Promise<KnowledgeSyncStatus> => {
    return apiClient.get<unknown, KnowledgeSyncStatus>("/admin/ai/knowledge/status");
  },

  syncKnowledge: async (): Promise<{
    success: boolean;
    jobId: string;
    snapshotVersion: string;
    toursCount: number;
    chunksCount: number;
    durationMs: number;
    datasetChecksum: string;
    trigger: string;
  }> => {
    return apiClient.post<unknown, any>("/admin/ai/knowledge/sync");
  },

  getRoutingPolicy: async (): Promise<RoutingPolicyData> => {
    return apiClient.get<unknown, RoutingPolicyData>("/admin/ai/routing");
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

  // Knowledge Base V5 Canonical CRUD & Overrides
  getCanonicalEntities: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    entityType?: string;
    sourceType?: string;
    aiStatus?: string;
    syncStatus?: string;
    search?: string;
  }): Promise<{ items: CanonicalKnowledgeEntity[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { items: CanonicalKnowledgeEntity[]; total: number; page: number; totalPages: number }>(
      "/admin/ai/knowledge/canonical-entities",
      { params },
    );
  },

  toggleCanonicalAi: async (canonicalId: string, isExcludedFromAi: boolean): Promise<{ success: boolean; isExcludedFromAi: boolean }> => {
    return apiClient.post<unknown, any>(`/admin/ai/knowledge/canonical/${encodeURIComponent(canonicalId)}/toggle-ai`, {
      isExcludedFromAi,
    });
  },

  toggleItemAi: async (id: string, isExcludedFromAi: boolean): Promise<{ success: boolean; isExcludedFromAi: boolean }> => {
    return apiClient.patch<unknown, any>(`/admin/ai/knowledge/${id}/toggle-ai`, { isExcludedFromAi });
  },

  updateCanonicalOverride: async (
    canonicalId: string,
    payload: {
      aiOverrideInstructions: string;
      aiOverrideContext?: string;
      isRecommendationAllowed?: boolean;
      validityStart?: string;
      validityEnd?: string;
      adminNotes?: string;
    },
  ): Promise<{ success: boolean; aiOverrideInstructions: string }> => {
    return apiClient.put<unknown, any>(`/admin/ai/knowledge/canonical/${encodeURIComponent(canonicalId)}/override`, payload);
  },

  clearCanonicalOverride: async (canonicalId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<unknown, any>(`/admin/ai/knowledge/canonical/${encodeURIComponent(canonicalId)}/override`);
  },

  getKnowledgeProblems: async (): Promise<KnowledgeProblemsSummary> => {
    return apiClient.get<unknown, KnowledgeProblemsSummary>("/admin/ai/knowledge/problems/summary");
  },

  executeBulkAction: async (action: 'ENABLE_AI' | 'DISABLE_AI' | 'ARCHIVE' | 'PUBLISH', ids: string[]): Promise<{ success: boolean; affectedCount: number }> => {
    return apiClient.post<unknown, any>("/admin/ai/knowledge/bulk-action", { action, ids });
  },

  getKnowledgeVersions: async (id: string): Promise<AiKnowledgeVersionItem[]> => {
    return apiClient.get<unknown, AiKnowledgeVersionItem[]>(`/admin/ai/knowledge/${id}/versions`);
  },

  restoreKnowledgeVersion: async (id: string, versionId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<unknown, any>(`/admin/ai/knowledge/${id}/restore-version/${versionId}`);
  },

  getKnowledge: async (params?: { page?: number; limit?: number; category?: string; locale?: string; status?: string; search?: string }): Promise<{ items: KnowledgeItemData[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { items: KnowledgeItemData[]; total: number; page: number; totalPages: number }>("/admin/ai/knowledge", { params });
  },

  createKnowledge: async (payload: Partial<KnowledgeItemData>): Promise<KnowledgeItemData> => {
    return apiClient.post<unknown, KnowledgeItemData>("/admin/ai/knowledge", payload);
  },

  createMultilingualKnowledge: async (payload: {
    title: string;
    content: string;
    sourceLocale?: string;
    category?: string;
    priority?: number;
    tags?: string[];
    autoTranslate?: boolean;
  }): Promise<{ success: boolean; canonicalEntityId: string; createdCount: number; items: any[] }> => {
    return apiClient.post("/admin/ai/knowledge/multilingual", payload);
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

  // Knowledge Chunks & Health
  getKnowledgeHealth: async (): Promise<{
    status: string;
    totalArticles: number;
    publishedCount: number;
    chunksCount: number;
    autoGeneratedCount: number;
    byLocale: Array<{ locale: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  }> => {
    return apiClient.get<unknown, any>("/admin/ai/knowledge/health");
  },

  getIndexedChunks: async (params?: { page?: number; limit?: number; locale?: string; entityType?: string; search?: string }): Promise<{ items: KnowledgeChunkItem[]; total: number; page: number; totalPages: number }> => {
    return apiClient.get<unknown, { items: KnowledgeChunkItem[]; total: number; page: number; totalPages: number }>("/admin/ai/knowledge/chunks", { params });
  },

  testRetrieval: async (payload: { query: string; locale?: string; allowedSources?: string[]; limit?: number }): Promise<{
    query: string;
    locale: string;
    latencyMs: number;
    matchedChunksCount: number;
    matchedToursCount: number;
    matchedHotelsCount: number;
    matchedTransportationCount: number;
    matchedChunks: KnowledgeChunkItem[];
    groundedTours: any[];
    groundedHotels: any[];
    groundedTransportation: any[];
    groundedSummaryText: string;
  }> => {
    return apiClient.post<unknown, any>("/admin/ai/knowledge/test-retrieval", payload);
  },

  // Direct Q&A Response Rules ("لو اتسألت عن X قول Y")
  getResponseRules: async (): Promise<{ rules: AiResponseRuleItem[]; total: number }> => {
    return apiClient.get<unknown, { rules: AiResponseRuleItem[]; total: number }>("/admin/ai/knowledge/response-rules");
  },

  createResponseRule: async (payload: {
    triggerQuestion: string;
    prescribedAnswer: string;
    category?: string;
    sourceLocale?: string;
    autoTranslate?: boolean;
    priority?: number;
  }): Promise<{ success: boolean; ruleId: string; createdCount: number }> => {
    return apiClient.post<unknown, any>("/admin/ai/knowledge/response-rules", payload);
  },

  toggleResponseRule: async (ruleId: string, isExcludedFromAi: boolean): Promise<{ success: boolean; ruleId: string; isExcludedFromAi: boolean }> => {
    return apiClient.patch<unknown, any>(`/admin/ai/knowledge/response-rules/${encodeURIComponent(ruleId)}/toggle`, { isExcludedFromAi });
  },

  deleteResponseRule: async (ruleId: string): Promise<{ success: boolean; deletedCount: number }> => {
    return apiClient.delete<unknown, any>(`/admin/ai/knowledge/response-rules/${encodeURIComponent(ruleId)}`);
  },

  // Agent Registry
  getAgents: async (locale = 'en'): Promise<AgentItemData[]> => {
    return apiClient.get<unknown, AgentItemData[]>("/admin/ai/agents", { params: { locale } });
  },

  getAgentBySlug: async (slug: string, locale = 'en'): Promise<AgentItemData> => {
    return apiClient.get<unknown, AgentItemData>(`/admin/ai/agents/${slug}`, { params: { locale } });
  },

  createAgent: async (payload: Partial<AgentItemData>): Promise<AgentItemData> => {
    return apiClient.post<unknown, AgentItemData>("/admin/ai/agents", payload);
  },

  updateAgent: async (id: string, payload: Partial<AgentItemData>): Promise<AgentItemData> => {
    return apiClient.put<unknown, AgentItemData>(`/admin/ai/agents/${id}`, payload);
  },

  activateAgent: async (id: string): Promise<{ success: boolean; agent: AgentItemData }> => {
    return apiClient.post<unknown, { success: boolean; agent: AgentItemData }>(`/admin/ai/agents/${id}/activate`);
  },

  deleteAgent: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<unknown, { success: boolean; id: string }>(`/admin/ai/agents/${id}`);
  },

  // Model Registry
  getAllModels: async (): Promise<{ models: ModelCapabilityItem[]; providers: ProviderItem[] }> => {
    return apiClient.get<unknown, { models: ModelCapabilityItem[]; providers: ProviderItem[] }>("/admin/ai/models");
  },

  // Diagnostics Simulator Trace
  runSimulatorTrace: (payload: {
    message: string;
    agentSlug?: string;
    model?: string;
    provider?: string;
    locale?: string;
    promptVersionId?: string;
    enableRag?: boolean;
    enableLiveDb?: boolean;
  }): Promise<DiagnosticTraceResponse> => {
    return apiClient.post<unknown, DiagnosticTraceResponse>("/admin/ai/simulator/trace", payload);
  },
};

