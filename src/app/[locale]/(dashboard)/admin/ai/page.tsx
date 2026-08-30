"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  UploadCloud, 
  MessageSquare, 
  Send, 
  Database, 
  Settings, 
  Activity, 
  Users, 
  RefreshCw, 
  Plus, 
  Eye, 
  Search, 
  Zap, 
  ShieldCheck,
  ShieldAlert,
  Key,
  Globe,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Languages,
  X,
  UserCheck,
  RotateCcw,
  Check,
  TrendingUp,
  FileCode,
  Edit3,
  Archive,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Crown,
  ArrowUp,
  ArrowDown,
  Power,
  PowerOff,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { ModelSelector } from "@/features/ai/components/ModelSelector";
import { 
  aiApi, 
  AiOverviewMetrics, 
  AiConfigData, 
  ApiKeyPoolEntry,
  KnowledgeItemData, 
  ConversationItemData,
  MultiLangTranslations,
  AiSafetyEventItem,
  PromptVersionItem,
  FeedbackItem,
  AiAnalyticsData,
} from "@/features/ai/api/aiApi";

interface SimMessage {
  role: 'user' | 'agent';
  text: string;
  tours?: any[];
}

const SUPPORTED_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic Claude', defaultModel: 'claude-3-5-sonnet-20241022', models: ['claude-3-5-sonnet-20241022', 'claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  { id: 'openai', name: 'OpenAI (ChatGPT)', defaultModel: 'gpt-4o', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4-turbo'] },
  { id: 'google', name: 'Google Gemini', defaultModel: 'gemini-2.0-flash', models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'] },
  { id: 'openrouter', name: 'OpenRouter (Chinese & Open Models)', defaultModel: 'deepseek/deepseek-chat', models: ['deepseek/deepseek-chat', 'deepseek/deepseek-r1', 'qwen/qwen-2.5-72b-instruct', 'meta-llama/llama-3.3-70b-instruct', 'moonshotai/moonshot-v1-32k'] },
  { id: 'deepseek', name: 'DeepSeek Direct', defaultModel: 'deepseek-chat', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { id: 'custom', name: 'Custom OpenAI-Compatible Endpoint', defaultModel: 'gpt-4o-mini', models: ['custom-model'] },
];

export default function AiAgentsPage() {
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Telemetry & Overview State
  const [metrics, setMetrics] = useState<AiOverviewMetrics | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Config State
  const [config, setConfig] = useState<Partial<AiConfigData>>({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    isEnabled: true,
    isPublicEnabled: true,
    temperature: 0.7,
    systemInstructions: 'You are GuideR (جايدر), the elite luxury AI Travel Concierge for Dunas Travel.',
    salesPersonality: 'Elite Luxury Concierge',
    toneOfVoice: 'Warm, Executive, Knowledgeable',
    fallbackMessage: "I'd be delighted to assist you with that! Would you like me to connect you with our senior travel specialists or help you customize a private itinerary?",
    escalationMessage: 'I have notified our senior travel team. A dedicated travel specialist will contact you shortly!',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // API Key Pool State
  const [keyPool, setKeyPool] = useState<ApiKeyPoolEntry[]>([]);
  const [loadingKeyPool, setLoadingKeyPool] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('anthropic');
  const [newKeyModel, setNewKeyModel] = useState('claude-3-5-sonnet-20241022');
  const [newKeyBaseUrl, setNewKeyBaseUrl] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyPriority, setNewKeyPriority] = useState(1);
  const [addingKey, setAddingKey] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

  // Edit Key Modal State
  const [showEditKeyModal, setShowEditKeyModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyPoolEntry | null>(null);
  const [editKeyProvider, setEditKeyProvider] = useState('anthropic');
  const [editKeyModel, setEditKeyModel] = useState('claude-3-5-sonnet-20241022');
  const [editKeyBaseUrl, setEditKeyBaseUrl] = useState('');
  const [editKeySecret, setEditKeySecret] = useState('');
  const [editKeyLabel, setEditKeyLabel] = useState('');
  const [editKeyPriority, setEditKeyPriority] = useState(1);
  const [editKeyActive, setEditKeyActive] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(false);

  // Simulator State
  const [simulatorSessionId] = useState(() => `admin-sim-${Date.now()}`);
  const [simPrompt, setSimPrompt] = useState("");
  const [simLocale, setSimLocale] = useState("ar");
  const [simLog, setSimLog] = useState<SimMessage[]>([
    { role: 'agent' as const, text: "أهلاً بك! 👋 أنا جايدر (GuideR)، مستشارك السياحي الذكي في دوناس ترافيل. كيف يمكنني مساعدتك في التخطيط لرحلتك الفاخرة اليوم؟" }
  ]);
  const [simTyping, setSimTyping] = useState(false);

  // Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItemData[]>([]);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [knowledgeCategory, setKnowledgeCategory] = useState("");
  const [knowledgeLocale, setKnowledgeLocale] = useState("");
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  // 5-Language Ingestion & Auto-Translation Modal
  const [showMultiLangModal, setShowMultiLangModal] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceLocale, setSourceLocale] = useState("ar");
  const [sourceCategory, setSourceCategory] = useState("GENERAL");
  const [translatingFiveLang, setTranslatingFiveLang] = useState(false);
  const [savingMultiLang, setSavingMultiLang] = useState(false);
  const [multiLangActiveTab, setMultiLangActiveTab] = useState("ar");
  const [translations, setTranslations] = useState<MultiLangTranslations>({
    ar: { title: "", content: "" },
    en: { title: "", content: "" },
    es: { title: "", content: "" },
    pt: { title: "", content: "" },
    it: { title: "", content: "" },
  });

  // Conversations & Leads State
  const [conversations, setConversations] = useState<ConversationItemData[]>([]);
  const [conversationsSearch, setConversationsSearch] = useState("");
  const [conversationsStatus, setConversationsStatus] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemData | null>(null);
  const [staffReplyText, setStaffReplyText] = useState("");
  const [sendingStaffReply, setSendingStaffReply] = useState(false);

  // Safety Events State
  const [safetyEvents, setSafetyEvents] = useState<AiSafetyEventItem[]>([]);
  const [loadingSafetyEvents, setLoadingSafetyEvents] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Analytics & FinOps State
  const [analyticsData, setAnalyticsData] = useState<AiAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Prompt Versions State
  const [promptVersions, setPromptVersions] = useState<PromptVersionItem[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [newPromptNote, setNewPromptNote] = useState("");
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [creatingPromptDraft, setCreatingPromptDraft] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptVersionItem | null>(null);
  const [showEditPromptModal, setShowEditPromptModal] = useState(false);
  const [updatingPrompt, setUpdatingPrompt] = useState(false);
  const [promptSearch, setPromptSearch] = useState("");
  const [promptFilterStatus, setPromptFilterStatus] = useState<string>("ALL");
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [seedingPrompts, setSeedingPrompts] = useState(false);
  const [selectedPresetPromptId, setSelectedPresetPromptId] = useState<string>("");

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState({ total: 0, positive: 0, negative: 0, satisfactionRate: 100 });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Load Initial Data
  useEffect(() => {
    fetchOverview();
    fetchConfig();
    fetchKeyPool();
    fetchKnowledge();
    fetchConversations();
    fetchAnalytics();
    fetchPrompts();
    fetchFeedback();
  }, []);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await aiApi.getOverview();
      if (res && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err: any) {
      console.warn("Failed to fetch AI overview metrics:", err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await aiApi.getDetailedAnalytics();
      setAnalyticsData(data);
    } catch (err: any) {
      console.warn("Failed to fetch AI analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const list = await aiApi.getPromptVersions();
      setPromptVersions(list || []);
    } catch (err: any) {
      console.warn("Failed to fetch prompt versions:", err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await aiApi.getFeedback();
      if (res && res.items) {
        setFeedbackList(res.items);
        setFeedbackSummary({
          total: res.total,
          positive: res.positiveCount,
          negative: res.negativeCount,
          satisfactionRate: res.satisfactionRate,
        });
      }
    } catch (err: any) {
      console.warn("Failed to fetch feedback summary:", err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await aiApi.getConfig();
      if (res) {
        setConfig(res);
      }
    } catch (err: any) {
      console.warn("Failed to fetch AI config:", err);
    }
  };

  const fetchKeyPool = async () => {
    setLoadingKeyPool(true);
    try {
      const res = await aiApi.getKeyPool();
      if (Array.isArray(res)) {
        setKeyPool(res);
      }
    } catch (err: any) {
      console.warn("Failed to fetch API key pool:", err);
    } finally {
      setLoadingKeyPool(false);
    }
  };

  const fetchKnowledge = async () => {
    setLoadingKnowledge(true);
    try {
      const res = await aiApi.getKnowledge({
        search: knowledgeSearch || undefined,
        category: knowledgeCategory || undefined,
        locale: knowledgeLocale || undefined,
      });
      if (res && res.items) {
        setKnowledgeItems(res.items);
      }
    } catch (err: any) {
      console.warn("Failed to fetch knowledge items:", err);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await aiApi.getConversations({
        search: conversationsSearch || undefined,
        status: conversationsStatus || undefined,
      });
      if (res && res.items) {
        setConversations(res.items);
      }
    } catch (err: any) {
      console.warn("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchSafetyEvents = async () => {
    setLoadingSafetyEvents(true);
    try {
      const res = await aiApi.getSafetyEvents();
      if (res && res.events) {
        setSafetyEvents(res.events);
      }
    } catch (err: any) {
      console.warn("Failed to fetch safety events:", err);
    } finally {
      setLoadingSafetyEvents(false);
    }
  };

  // Save General Configuration
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const payload: any = { ...config };
      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }
      const updated = await aiApi.updateConfig(payload);
      setConfig(updated);
      setApiKeyInput('');
      toast.success("AI concierge settings saved successfully!");
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to save AI configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await aiApi.testConnection({
        provider: config.provider,
        model: config.model,
        apiKey: apiKeyInput.trim() || undefined,
      });
      if (res && res.success) {
        toast.success(`Connected successfully! Latency: ${res.latencyMs || 0}ms. Output: ${res.message || "Verified"}`);
      } else {
        toast.error(res.error || "Connection test failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test failed.");
    } finally {
      setTestingConnection(false);
    }
  };

  // Priority calculation helper: returns next highest integer priority
  const getNextPriority = () => {
    if (!keyPool || keyPool.length === 0) return 1;
    const maxP = keyPool.reduce((max, k) => Math.max(max, k.priority || 0), 0);
    return maxP + 1;
  };

  // Open Add Key Modal with computed next priority
  const handleOpenAddKeyModal = () => {
    const nextPri = getNextPriority();
    setNewKeyPriority(nextPri);
    setNewKeySecret("");
    setNewKeyLabel("");
    setNewKeyBaseUrl("");
    const p = SUPPORTED_PROVIDERS.find((x) => x.id === newKeyProvider);
    if (p) setNewKeyModel(p.defaultModel);
    setShowAddKeyModal(true);
  };

  // Open Edit Key Modal
  const handleOpenEditKeyModal = (k: ApiKeyPoolEntry) => {
    setEditingKey(k);
    setEditKeyProvider(k.provider || 'anthropic');
    setEditKeyModel(k.model || '');
    setEditKeyBaseUrl(k.baseUrl || '');
    setEditKeySecret('');
    setEditKeyLabel(k.label || '');
    setEditKeyPriority(k.priority || 1);
    setEditKeyActive(k.isActive !== false);
    setShowEditKeyModal(true);
  };

  // Add Key to Pool
  const handleAddKeyToPool = async () => {
    if (!newKeySecret.trim()) {
      toast.error("Please enter a valid API secret key.");
      return;
    }
    setAddingKey(true);
    try {
      await aiApi.addKeyToPool({
        provider: newKeyProvider,
        model: newKeyModel,
        apiKey: newKeySecret.trim(),
        baseUrl: newKeyBaseUrl.trim() || undefined,
        label: newKeyLabel.trim() || undefined,
        priority: Number(newKeyPriority) || getNextPriority(),
        isActive: true,
      });
      toast.success("API key added to failover pool successfully!");
      setShowAddKeyModal(false);
      setNewKeySecret("");
      setNewKeyLabel("");
      fetchKeyPool();
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to add API key to pool.");
    } finally {
      setAddingKey(false);
    }
  };

  // Update Key in Pool
  const handleUpdateKeyInPool = async () => {
    if (!editingKey) return;
    setUpdatingKey(true);
    try {
      const payload: any = {
        provider: editKeyProvider,
        model: editKeyModel,
        baseUrl: editKeyBaseUrl.trim() || undefined,
        label: editKeyLabel.trim() || undefined,
        priority: Number(editKeyPriority) || editingKey.priority || 1,
        isActive: editKeyActive,
      };
      if (editKeySecret.trim()) {
        payload.apiKey = editKeySecret.trim();
      }
      await aiApi.updateKeyInPool(editingKey.id, payload);
      toast.success("API key updated successfully!");
      setShowEditKeyModal(false);
      setEditingKey(null);
      fetchKeyPool();
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to update API key.");
    } finally {
      setUpdatingKey(false);
    }
  };

  // Move Key Priority Up or Down
  const handleMovePriority = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...keyPool].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex((k) => k.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sorted];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map((k) => k.id);
    try {
      const updatedList = await aiApi.reorderKeysInPool(orderedIds);
      setKeyPool(updatedList);
      toast.success("Failover hierarchy updated!");
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder keys.");
      fetchKeyPool();
    }
  };

  // Toggle Key Active/Disabled status
  const handleToggleKeyActive = async (k: ApiKeyPoolEntry) => {
    try {
      const newActive = !k.isActive;
      await aiApi.updateKeyInPool(k.id, { isActive: newActive });
      toast.success(`Key "${k.label || k.model}" is now ${newActive ? 'Active & Ready' : 'Disabled'}.`);
      fetchKeyPool();
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle key status.");
    }
  };

  // Delete Key from Pool
  const handleDeleteKey = async (id: string) => {
    try {
      await aiApi.deleteKeyFromPool(id);
      toast.success("API key removed from pool.");
      fetchKeyPool();
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete API key.");
    }
  };

  // Test Specific Key in Pool
  const handleTestKey = async (id: string) => {
    setTestingKeyId(id);
    try {
      const res = await aiApi.testKeyInPool(id);
      if (res && res.success) {
        toast.success(`Key Verified! (${res.latencyMs || 0}ms): ${res.message}`);
      } else {
        toast.error(res.error || "Key test failed.");
      }
      fetchKeyPool();
    } catch (err: any) {
      toast.error(err.message || "Key test failed.");
    } finally {
      setTestingKeyId(null);
    }
  };

  // Run Simulator Message
  const handleSendSimulator = async () => {
    if (!simPrompt.trim()) return;
    const userMsg = simPrompt;
    setSimLog((prev) => [...prev, { role: 'user', text: userMsg }]);
    setSimPrompt("");
    setSimTyping(true);

    try {
      const res = await aiApi.runSimulator({
        message: userMsg,
        sessionId: simulatorSessionId,
        locale: simLocale,
      });

      const replyText = res.message.content || "Response generated.";
      const tours = res.recommendations.tours;
      setSimLog((prev) => [...prev, { role: 'agent', text: replyText, tours }]);
    } catch (err: any) {
      setSimLog((prev) => [...prev, { role: 'agent', text: `Error: ${err.message || "Simulator call failed."}` }]);
    } finally {
      setSimTyping(false);
    }
  };

  // Auto-translate to 5 Languages
  const handleAutoTranslateFiveLanguages = async () => {
    if (!sourceTitle.trim() || !sourceContent.trim()) {
      toast.error("Please provide both title and content in your source language.");
      return;
    }
    setTranslatingFiveLang(true);
    try {
      const res = await aiApi.autoTranslateKnowledge({
        title: sourceTitle,
        content: sourceContent,
        sourceLocale,
        category: sourceCategory,
      });

      if (res && res.translations) {
        setTranslations(res.translations);
        toast.success("AI generated all 5 language versions! Review tabs below before saving.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to auto-translate.");
    } finally {
      setTranslatingFiveLang(false);
    }
  };

  // Save Batch Multi-Language Articles
  const handleSaveBatchMultiLang = async () => {
    const articlesToSave = Object.entries(translations).map(([loc, data]) => ({
      title: data.title || sourceTitle,
      content: data.content || sourceContent,
      locale: loc,
      category: sourceCategory,
      priority: 15,
      tags: ['multilang', loc, sourceCategory.toLowerCase()],
    }));

    if (articlesToSave.some((a) => !a.title || !a.content)) {
      toast.error("Please ensure all 5 language tabs have valid titles and contents.");
      return;
    }

    setSavingMultiLang(true);
    try {
      const res = await aiApi.saveBatchMultiLangKnowledge({ articles: articlesToSave });
      if (res && res.success) {
        toast.success(`Successfully saved all 5 localized language articles to RAG store!`);
        setShowMultiLangModal(false);
        setSourceTitle("");
        setSourceContent("");
        fetchKnowledge();
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save multi-language articles.");
    } finally {
      setSavingMultiLang(false);
    }
  };

  // Sync DB Catalog to RAG Knowledge Base
  const handleSyncCatalog = async () => {
    setSyncingCatalog(true);
    try {
      const res = await aiApi.syncCatalogKnowledge();
      if (res && res.success) {
        toast.success(`Catalog Synced! ${res.syncedTours} Tours & ${res.syncedDestinations} Destinations ingested.`);
        fetchKnowledge();
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync catalog knowledge.");
    } finally {
      setSyncingCatalog(false);
    }
  };

  // View Conversation Detail
  const handleViewConversation = async (conv: ConversationItemData) => {
    try {
      const detail = await aiApi.getConversationDetail(conv.id);
      setSelectedConversation(detail || conv);
    } catch (err) {
      setSelectedConversation(conv);
    }
  };

  // Take Over Conversation
  const handleTakeover = async (id: string) => {
    try {
      await aiApi.takeoverConversation(id);
      toast.success("Live human takeover activated! Autonomous AI replies paused.");
      fetchConversations();
      if (selectedConversation && selectedConversation.id === id) {
        const detail = await aiApi.getConversationDetail(id);
        setSelectedConversation(detail);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to take over conversation.");
    }
  };

  // Send Staff Reply
  const handleSendStaffReply = async () => {
    if (!selectedConversation || !staffReplyText.trim()) return;
    setSendingStaffReply(true);
    try {
      await aiApi.staffReply(selectedConversation.id, staffReplyText.trim());
      toast.success("Staff reply sent to visitor!");
      setStaffReplyText("");
      const detail = await aiApi.getConversationDetail(selectedConversation.id);
      setSelectedConversation(detail);
    } catch (err: any) {
      toast.error(err.message || "Failed to send staff reply.");
    } finally {
      setSendingStaffReply(false);
    }
  };

  // Return to Autonomous AI
  const handleReturnToAi = async (id: string) => {
    try {
      await aiApi.returnToAi(id);
      toast.success("Conversation returned to autonomous GuideR AI.");
      fetchConversations();
      if (selectedConversation && selectedConversation.id === id) {
        const detail = await aiApi.getConversationDetail(id);
        setSelectedConversation(detail);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to return conversation to AI.");
    }
  };

  // Resolve Conversation
  const handleResolve = async (id: string) => {
    try {
      await aiApi.resolveConversation(id);
      toast.success("Conversation resolved and archived.");
      setSelectedConversation(null);
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve conversation.");
    }
  };

  // Create Prompt Draft
  const handleCreatePromptDraft = async () => {
    if (!newPromptName.trim() || !newPromptText.trim()) {
      toast.error("Please specify both prompt name and system instructions.");
      return;
    }
    setCreatingPromptDraft(true);
    try {
      await aiApi.createPromptDraft({
        name: newPromptName.trim(),
        systemPrompt: newPromptText.trim(),
        changeNote: newPromptNote.trim() || undefined,
      });
      toast.success("Draft prompt version created successfully!");
      setShowNewPromptModal(false);
      setNewPromptName("");
      setNewPromptText("");
      setNewPromptNote("");
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to create prompt draft.");
    } finally {
      setCreatingPromptDraft(false);
    }
  };

  // Open Edit Prompt Modal
  const handleOpenEditPrompt = (p: PromptVersionItem) => {
    setEditingPrompt(p);
    setShowEditPromptModal(true);
  };

  // Update Prompt Version
  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;
    setUpdatingPrompt(true);
    try {
      await aiApi.updatePromptVersion(editingPrompt.id, {
        name: editingPrompt.name,
        systemPrompt: editingPrompt.systemPrompt,
        changeNote: editingPrompt.changeNote || undefined,
        status: editingPrompt.status,
      });
      toast.success("Prompt version updated successfully!");
      setShowEditPromptModal(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to update prompt.");
    } finally {
      setUpdatingPrompt(false);
    }
  };

  // Delete Prompt Version
  const handleDeletePrompt = async (id: string) => {
    try {
      await aiApi.deletePromptVersion(id);
      toast.success("Prompt version deleted.");
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete prompt.");
    }
  };

  // Archive Prompt Version
  const handleArchivePrompt = async (id: string) => {
    try {
      await aiApi.archivePromptVersion(id);
      toast.success("Prompt version archived (inactive).");
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive prompt.");
    }
  };

  // Publish Prompt Version
  const handlePublishPrompt = async (id: string) => {
    try {
      await aiApi.publishPromptVersion(id);
      toast.success("Prompt published to LIVE production!");
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish prompt.");
    }
  };

  // Rollback Prompt Version
  const handleRollbackPrompt = async (id: string) => {
    try {
      await aiApi.rollbackPromptVersion(id);
      toast.success("Rolled back to previous prompt version successfully!");
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to rollback prompt.");
    }
  };

  // Seed Default Prompt Templates
  const handleSeedDefaultPrompts = async () => {
    setSeedingPrompts(true);
    try {
      const seeded = await aiApi.seedDefaultPrompts();
      setPromptVersions(seeded || []);
      toast.success("Curated luxury prompt templates seeded into database!");
    } catch (err: any) {
      toast.error(err.message || "Failed to seed default prompts.");
    } finally {
      setSeedingPrompts(false);
    }
  };

  // Filter Prompts
  const filteredPrompts = promptVersions.filter((p) => {
    const matchesSearch = promptSearch
      ? p.name.toLowerCase().includes(promptSearch.toLowerCase()) ||
        p.systemPrompt.toLowerCase().includes(promptSearch.toLowerCase()) ||
        (p.changeNote && p.changeNote.toLowerCase().includes(promptSearch.toLowerCase()))
      : true;
    const matchesStatus = promptFilterStatus === "ALL" || p.status === promptFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedKeyPool = [...keyPool].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title={tAi("title") || "AI Concierge & Autonomous Operations"}
          description={tAi("description") || "Enterprise command center for GuideR luxury sales bot, multi-provider failover routing, RAG store, and FinOps analytics."}
        />
        <div className="flex items-center gap-2.5">
          <Button 
            onClick={fetchOverview} 
            disabled={loadingOverview}
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingOverview ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
          <Button 
            onClick={() => setActiveTab("simulator")}
            variant="gold" 
            size="sm" 
            className="gap-1.5 text-xs font-bold shadow-xs"
          >
            <Bot className="h-4 w-4" /> Launch GuideR Simulator
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
          <TabsTrigger value="overview" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Activity className="h-3.5 w-3.5 me-1.5 text-amber-500" /> Overview
          </TabsTrigger>
          <TabsTrigger value="keys" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs relative">
            <Key className="h-3.5 w-3.5 me-1.5 text-amber-500" /> Failover Pool
            {keyPool.length > 0 && (
              <span className="ms-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-bold">
                {keyPool.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Settings className="h-3.5 w-3.5 me-1.5 text-primary" /> Core Prompts
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Sparkles className="h-3.5 w-3.5 me-1.5 text-amber-500" /> Prompt Studio
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Database className="h-3.5 w-3.5 me-1.5 text-blue-500" /> RAG Catalog
          </TabsTrigger>
          <TabsTrigger value="simulator" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Bot className="h-3.5 w-3.5 me-1.5 text-purple-500" /> Simulator
          </TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <MessageSquare className="h-3.5 w-3.5 me-1.5 text-emerald-500" /> Live Takeover
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <TrendingUp className="h-3.5 w-3.5 me-1.5 text-indigo-500" /> FinOps & ROI
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Telemetry */}
        <TabsContent value="overview" className="m-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">إجمالي جلسات المحادثة</p>
                  <p className="text-2xl font-bold mt-1 font-mono">{metrics?.totalConversations ?? 0}</p>
                  <span className="text-[11px] text-emerald-600 font-bold">{metrics?.activeConversations ?? 0} جلسات نشطة حالياً</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">العملاء المؤهلون (Leads)</p>
                  <p className="text-2xl font-bold mt-1 font-mono">{metrics?.qualifiedLeads ?? 0}</p>
                  <span className="text-[11px] text-amber-600 font-bold">{metrics?.handedOffConversations ?? 0} تحويلات VIP للمبيعات</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">مجمع مفاتيح الذكاء البديلة</p>
                  <p className="text-2xl font-bold mt-1 font-mono">{keyPool.length} مفاتيح</p>
                  <span className="text-[11px] text-emerald-600 font-bold">{keyPool.filter((k) => k.isActive).length} نشط وجاهز للتبديل الفوري</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">متوسط الاستجابة والتكلفة</p>
                  <p className="text-2xl font-bold mt-1 font-mono">{metrics?.avgLatencyMs ?? 0} ms</p>
                  <span className="text-[11px] text-purple-600 font-mono font-bold">التكلفة التقديرية: ${metrics?.estimatedCostUsd ?? '0.0000'}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  حالة محرك المساعد الذكي GuideR
                </CardTitle>
                <CardDescription className="text-xs">حالة صحة النظام واستقرار مزودي الذكاء الاصطناعي المتعددين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 text-xs">
                  <span className="font-bold text-muted-foreground">حالة المساعد الذكي العام</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">متصل ومحمي 🟢</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 text-xs">
                  <span className="font-bold text-muted-foreground">المزود الرئيسي النشط</span>
                  <span className="font-mono font-bold uppercase text-primary">{config.provider} ({config.model})</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 text-xs">
                  <span className="font-bold text-muted-foreground">نظام قاطع التحويل التلقائي</span>
                  <span className="font-bold text-emerald-600">التبديل الفوري التلقائي مفعّل ⚡</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 text-xs">
                  <span className="font-bold text-muted-foreground">ربط كتالوج الرحلات (RAG)</span>
                  <span className="font-bold text-blue-600">قاعدة بيانات متزامنة بـ 5 لغات</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  العمليات والإجراءات الفورية
                </CardTitle>
                <CardDescription className="text-xs">إجراءات التحكم المباشرة لمزامنة المعرفة الذكية وتحديث المقاييس</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleSyncCatalog} 
                  disabled={syncingCatalog} 
                  className="w-full justify-start gap-2 text-xs font-bold rounded-xl"
                  variant="gold"
                >
                  <RefreshCw className={`h-4 w-4 ${syncingCatalog ? 'animate-spin' : ''}`} />
                  {syncingCatalog ? "جاري مزامنة الرحلات مع قاعدة المعرفة الذكية..." : "مزامنة الرحلات والأدلة مع قاعدة المعرفة (RAG) 🔄"}
                </Button>
                <Button 
                  onClick={() => setShowMultiLangModal(true)} 
                  className="w-full justify-start gap-2 text-xs font-bold rounded-xl"
                  variant="outline"
                >
                  <Languages className="h-4 w-4 text-blue-500" /> Open 5-Language AI Ingestion Generator
                </Button>
                <Button 
                  onClick={() => {
                    fetchSafetyEvents();
                    setShowSafetyModal(true);
                  }} 
                  className="w-full justify-start gap-2 text-xs"
                  variant="outline"
                >
                  <ShieldAlert className="h-4 w-4 text-red-500" /> Security & Prompt Injection Audit Logs
                </Button>
                <Button 
                  onClick={() => { fetchOverview(); fetchConfig(); fetchKeyPool(); fetchKnowledge(); fetchConversations(); toast.success("Telemetry refreshed!"); }} 
                  className="w-full justify-start gap-2 text-xs"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 text-primary" /> Refresh System Telemetry & Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Multi-API Key Failover Pool (Enhanced UI/UX with Priority Engine & Edit) */}
        <TabsContent value="keys" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" /> Multi-API Key Failover Pool & Provider Routing
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  توزيع وترتيب مفاتيح الذكاء الاصطناعي مع التبديل التلقائي الفوري (Failover Circuit Breaker). يبدأ النظام بالمفتاح صاحب الأولوية (#1)، وفي حال حدوث ضغط أو نفاذ رصيد ينتقل فوراً للأولوية التالية.
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddKeyModal} variant="gold" size="sm" className="gap-1.5 text-xs font-bold shrink-0">
                <Plus className="h-4 w-4" /> + Add API Key to Pool (إضافة مفتاح جديد)
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKeyPool ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                  <span>جاري تحميل مجمع مفاتيح الذكاء البديلة...</span>
                </div>
              ) : sortedKeyPool.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-border/80 rounded-2xl text-center text-xs text-muted-foreground space-y-3 bg-muted/10">
                  <Key className="h-10 w-10 mx-auto text-amber-500/60" />
                  <p className="font-bold text-sm text-foreground">لا توجد مفاتيح ذكاء اصطناعي مضافة في مجمع التبديل بعد.</p>
                  <p className="text-xs max-w-md mx-auto text-muted-foreground">
                    أضف مفاتيحك لمزودي الخدمة (Google Gemini, Anthropic Claude, OpenAI, DeepSeek, OpenRouter) لضمان استمرارية الردود بدون توقف.
                  </p>
                  <Button onClick={handleOpenAddKeyModal} variant="gold" size="sm" className="font-bold gap-1.5 mt-2 rounded-xl">
                    <Plus className="h-4 w-4" /> إضافة أول مفتاح API ➕
                  </Button>
                </div>
              ) : (
                <div className="border border-border/60 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-muted/60 font-bold text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border/60">
                      <tr>
                        <th className="p-3.5 w-32">الترتيب والأولوية</th>
                        <th className="p-3.5">المزود والنموذج</th>
                        <th className="p-3.5">المفتاح المشفر</th>
                        <th className="p-3.5">حالة الصحة</th>
                        <th className="p-3.5">زمن الاستجابة</th>
                        <th className="p-3.5">مرات الإخفاق</th>
                        <th className="p-3.5">حالة التفعيل</th>
                        <th className="p-3.5 text-left">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-card">
                      {sortedKeyPool.map((k, index) => {
                        const isPrimary = index === 0 && k.priority === 1;
                        const isBackup = index === 1;
                        return (
                          <tr key={k.id} className="hover:bg-muted/20 transition-colors">
                            {/* Priority Column with Quick Reorder buttons */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => handleMovePriority(k.id, 'up')}
                                    disabled={index === 0}
                                    title="Move Up in Failover Order (رفع الأولوية)"
                                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMovePriority(k.id, 'down')}
                                    disabled={index === sortedKeyPool.length - 1}
                                    title="Move Down in Failover Order (خفض الأولوية)"
                                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {isPrimary ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-black text-xs border border-amber-500/40 flex items-center gap-1 shadow-xs">
                                    <Crown className="h-3 w-3 fill-amber-500 text-amber-500" /> #{k.priority}
                                  </span>
                                ) : isBackup ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs border border-blue-500/30">
                                    #{k.priority}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-mono font-semibold text-xs border border-border">
                                    #{k.priority}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Provider & Model */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-foreground capitalize text-xs">{k.provider}</p>
                                  {k.label && (
                                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                                      {k.label}
                                    </span>
                                  )}
                                </div>
                                <p className="font-mono text-[11px] text-muted-foreground font-semibold">{k.model}</p>
                              </div>
                            </td>

                            {/* Masked Secret Key */}
                            <td className="p-3.5 font-mono text-muted-foreground text-xs">
                              {k.maskedKey || '••••••••••••••••'}
                            </td>

                            {/* Health Status */}
                            <td className="p-3.5">
                              {k.lastStatus === 'HEALTHY' && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-max border border-emerald-500/20">
                                  <CheckCircle2 className="h-3 w-3" /> HEALTHY
                                </span>
                              )}
                              {k.lastStatus === 'RATE_LIMITED' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 w-max border border-amber-500/20">
                                  <AlertTriangle className="h-3 w-3" /> RATE LIMITED (429)
                                </span>
                              )}
                              {k.lastStatus === 'FAILED' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center gap-1 w-max border border-red-500/20">
                                  <XCircle className="h-3 w-3" /> FAILED
                                </span>
                              )}
                              {k.lastStatus === 'UNTESTED' && (
                                <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px] border border-border/80">
                                  UNTESTED
                                </span>
                              )}
                            </td>

                            {/* Latency */}
                            <td className="p-3.5 font-mono font-semibold">
                              {k.lastLatencyMs ? (
                                <span className={k.lastLatencyMs < 1200 ? "text-emerald-600" : k.lastLatencyMs < 3000 ? "text-amber-600" : "text-red-500"}>
                                  {k.lastLatencyMs} ms
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>

                            {/* Fail Count */}
                            <td className="p-3.5 font-semibold">
                              <span className={k.failCount > 0 ? "text-red-500 font-bold" : "text-muted-foreground"}>
                                {k.failCount}
                              </span>
                            </td>

                            {/* Active Toggle Switch */}
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleKeyActive(k)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  k.isActive 
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                }`}
                              >
                                {k.isActive ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
                                {k.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </td>

                            {/* Actions Column: Test, Edit, Delete */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  onClick={() => handleTestKey(k.id)} 
                                  disabled={testingKeyId === k.id} 
                                  size="xs" 
                                  variant="outline"
                                  title="Test Key Connectivity (فحص الاتصال)"
                                  className="h-7 px-2 text-xs"
                                >
                                  <Play className={`h-3 w-3 me-1 text-emerald-600 ${testingKeyId === k.id ? 'animate-spin' : ''}`} />
                                  Test
                                </Button>
                                <Button 
                                  onClick={() => handleOpenEditKeyModal(k)} 
                                  size="xs" 
                                  variant="outline"
                                  title="Edit Key, Priority, Model (تعديل شامل)"
                                  className="h-7 px-2 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                >
                                  <Edit3 className="h-3 w-3 me-1" />
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => handleDeleteKey(k.id)} 
                                  size="xs" 
                                  variant="destructive"
                                  title="Delete Key (حذف)"
                                  className="h-7 px-2 text-xs"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Core Prompts & Personality */}
        <TabsContent value="config" className="m-0 space-y-6">
          {/* Master Toggles & In-Chat Booking Feature Control */}
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                تحكم الخصائص وتفعيل الحجز المباشر (Feature Controls & In-Chat Booking)
              </CardTitle>
              <CardDescription>
                تحكم في تفعيل أو إيقاف ميزة الحجز الفوري من داخل الشات وإتاحة الشات بوت للجمهور العام.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* In-Chat Booking Master Toggle */}
                <div className="p-4 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        ⚡ الحجز المباشر عبر الشات (In-Chat Booking)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (config.isInChatBookingEnabled ?? true)
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {(config.isInChatBookingEnabled ?? true) ? 'مفعّل (Active)' : 'معطّل (Disabled)'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      إتاحة زر "احجز الآن" ونافذة الحجز الفوري للعملاء من داخل محادثة GuideR وإنشاء حجوزات وفواتير مباشرة.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={(config.isInChatBookingEnabled ?? true) ? "gold" : "outline"}
                    size="sm"
                    onClick={() => setConfig((prev) => ({
                      ...prev,
                      isInChatBookingEnabled: !(prev.isInChatBookingEnabled ?? true),
                    }))}
                    className="shrink-0 text-xs font-bold gap-1.5 h-9"
                  >
                    {(config.isInChatBookingEnabled ?? true) ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-950" /> مفعّل (شغال)
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-3.5 w-3.5 text-rose-500" /> معطّل (مفصول)
                      </>
                    )}
                  </Button>
                </div>

                {/* Public Availability Master Toggle */}
                <div className="p-4 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        🌐 ظهور الشات بوت للزوار (Public Availability)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        config.isPublicEnabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {config.isPublicEnabled ? 'ظاهر للجمهور' : 'مخفي مؤقتاً'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      تفعيل ظهور أيقونة ونافذة GuideR للزوار في الموقع الرئيسي أو إخفاؤها للصيانة.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={config.isPublicEnabled ? "gold" : "outline"}
                    size="sm"
                    onClick={() => setConfig((prev) => ({
                      ...prev,
                      isPublicEnabled: !prev.isPublicEnabled,
                    }))}
                    className="shrink-0 text-xs font-bold gap-1.5 h-9"
                  >
                    {config.isPublicEnabled ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-950" /> مفعّل (ظاهر)
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-3.5 w-3.5 text-rose-500" /> مخفي
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompt Template Selector Bar */}
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      قوالب البرومبتات المحفوظة (Stored Prompt Presets)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      اختر أي برومبت جاهز من قاعدة البيانات لتطبيقه أو تفعيله فوراً على شخصية الذكاء الاصطناعي.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleSeedDefaultPrompts}
                    disabled={seedingPrompts}
                    variant="outline"
                    size="xs"
                    className="text-xs gap-1 border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    <RefreshCw className={`h-3 w-3 ${seedingPrompts ? 'animate-spin' : ''}`} />
                    استعادة الـ 7 برومبتات الجاهزة
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
                <div className="flex-1">
                  <select
                    value={selectedPresetPromptId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPresetPromptId(id);
                      const chosen = promptVersions.find((p) => p.id === id);
                      if (chosen) {
                        setConfig((prev) => ({
                          ...prev,
                          systemInstructions: chosen.systemPrompt,
                        }));
                        toast.success(`تم تحميل برومبت "${chosen.name}" إلى المحرر بنجاح!`);
                      }
                    }}
                    className="w-full p-2.5 rounded-lg bg-background border border-border/80 text-xs font-bold cursor-pointer text-foreground focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="" disabled>-- اضغط هنا لاختيار برومبت من قاعدة البيانات (Select Stored Prompt) --</option>
                    {promptVersions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.status === 'PUBLISHED' ? '🌟 [نشط حالياً] ' : p.status === 'DRAFT' ? '📝 [مسودة] ' : '📦 [مؤرشف] '}
                        {p.name} (v{p.versionNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPresetPromptId && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        const chosen = promptVersions.find((p) => p.id === selectedPresetPromptId);
                        if (chosen) {
                          setConfig((prev) => ({
                            ...prev,
                            systemInstructions: chosen.systemPrompt,
                          }));
                          toast.success(`تم تحميل برومبت "${chosen.name}" إلى المحرر!`);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-9"
                    >
                      تحميل في المحرر
                    </Button>
                    <Button
                      onClick={() => handlePublishPrompt(selectedPresetPromptId)}
                      variant="gold"
                      size="sm"
                      className="text-xs font-bold h-9 gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> تفعيل ونشر فوراً
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> GuideR Personality & Execution Prompts
              </CardTitle>
              <CardDescription>
                Fine-tune system instructions, sales concierge persona, tone of voice, and default fallback responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Default Fallback Provider</label>
                  <select
                    value={config.provider || 'anthropic'}
                    onChange={(e) => {
                      const p = SUPPORTED_PROVIDERS.find((x) => x.id === e.target.value);
                      setConfig({ ...config, provider: e.target.value, model: p?.defaultModel || config.model });
                    }}
                    className="w-full p-2.5 rounded-lg bg-background border border-border/80 text-xs font-semibold"
                  >
                    {SUPPORTED_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <ModelSelector
                    provider={config.provider || 'anthropic'}
                    value={config.model || 'claude-3-5-sonnet-20241022'}
                    onChange={(m) => setConfig((prev) => ({ ...prev, model: m }))}
                    label="Default Fallback Model (الموديل الافتراضي)"
                    isAr={false}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Master System Prompt & Zero-Hallucination Guardrails</label>
                <Textarea 
                  rows={7}
                  value={config.systemInstructions || ''}
                  onChange={(e) => setConfig({ ...config, systemInstructions: e.target.value })}
                  className="text-xs leading-relaxed font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sales Persona</label>
                  <Input 
                    value={config.salesPersonality || ''}
                    onChange={(e) => setConfig({ ...config, salesPersonality: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Tone of Voice</label>
                  <Input 
                    value={config.toneOfVoice || ''}
                    onChange={(e) => setConfig({ ...config, toneOfVoice: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Offline / RAG Fallback Response</label>
                <Textarea 
                  rows={2}
                  value={config.fallbackMessage || ''}
                  onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button onClick={handleTestConnection} disabled={testingConnection} variant="outline" size="sm">
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>
                <Button onClick={handleSaveConfig} disabled={savingConfig} variant="gold" size="sm">
                  {savingConfig ? "Saving..." : "Save Concierge Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: 5-Language RAG Knowledge Base */}
        <TabsContent value="knowledge" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" /> Grounded RAG Knowledge Base (5 Languages)
                </CardTitle>
                <CardDescription>
                  Grounded facts across Tours, Nile Cruises, Booking Policies, and Destinations in Arabic, English, Spanish, Portuguese, and Italian.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowMultiLangModal(true)} variant="gold" size="sm" className="gap-1.5">
                  <Languages className="h-4 w-4" /> Add 5-Language Article
                </Button>
                <Button onClick={handleSyncCatalog} disabled={syncingCatalog} variant="outline" size="sm" className="gap-1.5">
                  <RefreshCw className={`h-3.5 w-3.5 ${syncingCatalog ? 'animate-spin' : ''}`} /> Sync DB Catalog
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Input 
                  placeholder="Search articles by title, content, or tag..."
                  value={knowledgeSearch}
                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchKnowledge()}
                  className="max-w-xs text-xs"
                />
                <select
                  value={knowledgeLocale}
                  onChange={(e) => { setKnowledgeLocale(e.target.value); }}
                  className="text-xs bg-muted border border-border/60 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="">All Locales (جميع اللغات)</option>
                  <option value="ar">🇸🇦 Arabic (ar)</option>
                  <option value="en">🇬🇧 English (en)</option>
                  <option value="es">🇪🇸 Spanish (es)</option>
                  <option value="pt">🇵🇹 Portuguese (pt)</option>
                  <option value="it">🇮🇹 Italian (it)</option>
                </select>
                <select
                  value={knowledgeCategory}
                  onChange={(e) => { setKnowledgeCategory(e.target.value); }}
                  className="text-xs bg-muted border border-border/60 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="">All Categories</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="CUSTOM_TOURS">CUSTOM_TOURS</option>
                  <option value="BOOKING_POLICY">BOOKING_POLICY</option>
                  <option value="DESTINATION_INFO">DESTINATION_INFO</option>
                  <option value="FAQ">FAQ</option>
                  <option value="TRANSPORTATION">TRANSPORTATION</option>
                </select>
                <Button onClick={fetchKnowledge} size="sm" variant="outline" className="text-xs">
                  <Search className="h-3.5 w-3.5 me-1" /> Search
                </Button>
              </div>

              {loadingKnowledge ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading Knowledge Items...</div>
              ) : knowledgeItems.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-3">
                  <Database className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">No knowledge articles found in RAG store.</p>
                  <p className="text-[11px]">Add factual knowledge articles in 5 languages or sync existing Database tours.</p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setShowMultiLangModal(true)} variant="gold" size="sm">
                      Create 5-Language Article
                    </Button>
                    <Button onClick={handleSyncCatalog} variant="outline" size="sm">
                      Sync DB Tours
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Language</th>
                        <th className="p-3">Title & Tags</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {knowledgeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono font-bold uppercase">
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {item.locale}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-foreground">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-md">{item.content}</p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.map((t, idx) => (
                                  <span key={idx} className="px-1.5 py-0.2 rounded bg-muted text-[10px] text-muted-foreground">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[11px]">{item.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{item.source || 'MANUAL'}</td>
                          <td className="p-3 text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Simulator */}
        <TabsContent value="simulator" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" /> Live GuideR Concierge Interactive Test Sandbox
                </CardTitle>
                <CardDescription>
                  Interact directly with GuideR to test system prompt adherence, tour discovery, luxury tone, and zero-latency failover.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Simulation Language:</span>
                <select
                  value={simLocale}
                  onChange={(e) => setSimLocale(e.target.value)}
                  className="text-xs bg-muted border border-border/60 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="ar">🇸🇦 Arabic (عربي)</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="pt">🇵🇹 Portuguese</option>
                  <option value="it">🇮🇹 Italian</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[420px] overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border/60 space-y-4">
                {simLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-xs' 
                        : 'bg-card border border-border/80 text-foreground rounded-tl-xs shadow-xs space-y-3'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.tours && msg.tours.length > 0 && (
                        <div className="border-t border-border/60 pt-2.5 mt-2 space-y-2">
                          <span className="text-[11px] font-bold text-primary block">✨ Recommended Itineraries:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.tours.map((t: any, idx: number) => (
                              <div key={idx} className="p-2 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
                                <p className="font-bold text-foreground">{t.title || t.slug}</p>
                                <p className="text-muted-foreground font-mono text-[10px]">${t.price || 0} USD</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {simTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-card border border-border/80 rounded-tl-xs text-xs text-muted-foreground animate-pulse">
                      GuideR is consulting luxury catalog & formulating response...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input 
                  value={simPrompt}
                  onChange={(e) => setSimPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSimulator()}
                  placeholder="Type a traveler inquiry... (e.g. 'أريد رحلة نيلية فاخرة لمدة 5 أيام مع أهرامات الجيزة')"
                  className="text-xs"
                />
                <Button onClick={handleSendSimulator} disabled={simTyping || !simPrompt.trim()} variant="gold" size="sm" className="gap-1.5">
                  <Send className="h-4 w-4" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Conversations & Live Staff Takeover */}
        <TabsContent value="conversations" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" /> Live Traveler Conversations & Lead Takeover
                </CardTitle>
                <CardDescription>
                  Monitor autonomous conversations in real-time, view buyer intent signals, and take over live chat instantly.
                </CardDescription>
              </div>
              <Button onClick={fetchConversations} variant="outline" size="sm" className="gap-1.5 text-xs">
                <RefreshCw className={`h-3.5 w-3.5 ${loadingConversations ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input 
                  placeholder="Search by visitor name, email, or session ID..."
                  value={conversationsSearch}
                  onChange={(e) => setConversationsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                  className="max-w-xs text-xs"
                />
                <select
                  value={conversationsStatus}
                  onChange={(e) => setConversationsStatus(e.target.value)}
                  className="text-xs bg-muted border border-border/60 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE (AI Responding)</option>
                  <option value="HANDED_OFF">HANDED_OFF (Staff Taken Over)</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <Button onClick={fetchConversations} size="sm" variant="outline" className="text-xs">
                  <Search className="h-3.5 w-3.5 me-1" /> Filter
                </Button>
              </div>

              {loadingConversations ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading Conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">No active chat conversations found.</p>
                  <p className="text-[11px]">Live visitor conversations will automatically stream here.</p>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Session / Visitor</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Lead State</th>
                        <th className="p-3">Last Message</th>
                        <th className="p-3">Updated</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {conversations.map((conv) => (
                        <tr key={conv.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <p className="font-bold text-foreground">{conv.visitorName || 'Anonymous Traveler'}</p>
                            <p className="text-muted-foreground font-mono text-[11px]">{conv.visitorEmail || conv.publicSessionId}</p>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              conv.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
                              conv.status === 'HANDED_OFF' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {conv.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              conv.leadStatus === 'QUALIFIED' ? 'bg-purple-500/10 text-purple-600' :
                              conv.leadStatus === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-600' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {conv.leadStatus || 'NEW'}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground truncate max-w-xs">
                            {conv.messages && conv.messages.length > 0 ? (conv.messages[0] as any)?.textContent || (conv.messages[0] as any)?.content || '—' : '—'}
                          </td>
                          <td className="p-3 text-muted-foreground">{new Date(conv.updatedAt).toLocaleTimeString()}</td>
                          <td className="p-3 text-right space-x-1.5">
                            <Button onClick={() => handleViewConversation(conv)} size="xs" variant="outline">
                              <Eye className="h-3 w-3 me-1" /> View Transcript
                            </Button>
                            {conv.status === 'ACTIVE' && (
                              <Button onClick={() => handleTakeover(conv.id)} size="xs" variant="gold">
                                <UserCheck className="h-3 w-3 me-1" /> Take Over
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: FinOps, ROI & Analytics */}
        <TabsContent value="analytics" className="m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Total Tokens Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono">{analyticsData?.summary?.totalTokens?.toLocaleString() || (metrics?.totalTokens || 0).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                  <span>Total Telemetry Tokens:</span>
                  <span className="font-mono font-semibold">{(analyticsData?.summary?.totalTokens || metrics?.totalTokens || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Average Latency:</span>
                  <span className="font-mono font-semibold">{analyticsData?.summary?.avgLatencyMs || metrics?.avgLatencyMs || 0} ms</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Estimated LLM FinOps Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600 font-mono">${analyticsData?.summary?.totalCostUsd ?? metrics?.estimatedCostUsd ?? '0.0000'}</p>
                <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                  Calculated based on actual prompt/completion token pricing per model.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Visitor Satisfaction Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-500 font-mono">{feedbackSummary.satisfactionRate}% Positive</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                  <span>👍 Helpful: <strong className="text-emerald-600">{feedbackSummary.positive}</strong></span>
                  <span>👎 Unhelpful: <strong className="text-red-500">{feedbackSummary.negative}</strong></span>
                  <span>Total Votes: <strong>{feedbackSummary.total}</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" /> Recent Traveler Message Ratings & Heuristics
              </CardTitle>
              <CardDescription>Direct feedback left by visitors on AI-generated travel itineraries and answers.</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackList.length === 0 ? (
                <p className="text-xs text-center py-8 text-muted-foreground">No feedback ratings submitted yet by visitors.</p>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Comment / Feedback</th>
                        <th className="p-3">Session</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {feedbackList.map((f) => (
                        <tr key={f.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            {f.rating >= 4 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1 w-max">
                                <ThumbsUp className="h-3 w-3" /> Helpful ({f.rating}/5)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold text-[10px] flex items-center gap-1 w-max">
                                <ThumbsDown className="h-3 w-3" /> Unhelpful ({f.rating}/5)
                              </span>
                            )}
                          </td>
                          <td className="p-3">{f.comments || '<No comment provided>'}</td>
                          <td className="p-3 font-mono text-muted-foreground">{f.conversation?.publicSessionId || f.conversationId || '—'}</td>
                          <td className="p-3 text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Prompt Versions Management */}
        <TabsContent value="prompts" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> System Prompt Version Management & A/B Studio
                </CardTitle>
                <CardDescription>
                  Full lifecycle for system prompts: Create drafts, edit instructions, publish to production with 1-click, and rollback instantly.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSeedDefaultPrompts} disabled={seedingPrompts} variant="outline" size="sm" className="gap-1 text-xs">
                  <RefreshCw className={`h-3 w-3 ${seedingPrompts ? 'animate-spin' : ''}`} /> Seed Luxury Presets
                </Button>
                <Button onClick={() => setShowNewPromptModal(true)} variant="gold" size="sm" className="gap-1 text-xs font-bold">
                  <Plus className="h-3.5 w-3.5" /> New Prompt Draft
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2.5 items-center">
                <Input 
                  placeholder="Search prompt versions by name or instructions..."
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  className="max-w-xs text-xs"
                />
                <select
                  value={promptFilterStatus}
                  onChange={(e) => setPromptFilterStatus(e.target.value)}
                  className="text-xs bg-muted border border-border/60 rounded-md px-2 py-1.5 font-semibold"
                >
                  <option value="ALL">All Statuses (الكل)</option>
                  <option value="PUBLISHED">🌟 PUBLISHED (Active in Production)</option>
                  <option value="DRAFT">📝 DRAFT (Work in progress)</option>
                  <option value="ARCHIVED">📦 ARCHIVED (Historical versions)</option>
                </select>
              </div>

              {loadingPrompts ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading Prompt Versions...</div>
              ) : filteredPrompts.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-3">
                  <FileCode className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">No prompt versions found.</p>
                  <p className="text-[11px]">Create a new prompt draft or seed the 7 curated luxury prompt templates.</p>
                  <Button onClick={handleSeedDefaultPrompts} variant="gold" size="sm">
                    Seed 7 Luxury Prompt Templates
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrompts.map((p) => {
                    const isExpanded = expandedPromptId === p.id;
                    const isLive = p.status === 'PUBLISHED';
                    return (
                      <div 
                        key={p.id} 
                        className={`border rounded-xl p-4 transition-all ${
                          isLive 
                            ? 'border-amber-500/40 bg-amber-500/5 shadow-xs' 
                            : 'border-border/60 bg-card hover:border-border'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                              v{p.versionNumber}
                            </span>
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                              {p.name}
                              {isLive && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> LIVE IN PRODUCTION
                                </span>
                              )}
                              {p.status === 'DRAFT' && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold text-[10px]">
                                  DRAFT
                                </span>
                              )}
                              {p.status === 'ARCHIVED' && (
                                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold text-[10px]">
                                  ARCHIVED
                                </span>
                              )}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button 
                              onClick={() => setExpandedPromptId(isExpanded ? null : p.id)}
                              size="xs" 
                              variant="ghost"
                              className="text-xs gap-1"
                            >
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {isExpanded ? 'Collapse' : 'Preview'}
                            </Button>

                            <Button 
                              onClick={() => handleOpenEditPrompt(p)}
                              size="xs" 
                              variant="outline"
                              className="text-xs gap-1"
                            >
                              <Edit3 className="h-3 w-3" /> Edit
                            </Button>

                            {!isLive && (
                              <Button 
                                onClick={() => handlePublishPrompt(p.id)}
                                size="xs" 
                                variant="gold"
                                className="text-xs font-bold gap-1 shadow-xs"
                              >
                                <Check className="h-3 w-3" /> Publish Live
                              </Button>
                            )}

                            {isLive && (
                              <Button 
                                onClick={() => handleRollbackPrompt(p.id)}
                                size="xs" 
                                variant="outline"
                                className="text-xs gap-1 text-amber-600"
                              >
                                <RotateCcw className="h-3 w-3" /> Rollback
                              </Button>
                            )}

                            {p.status !== 'ARCHIVED' && !isLive && (
                              <Button 
                                onClick={() => handleArchivePrompt(p.id)}
                                size="xs" 
                                variant="ghost"
                                className="text-xs text-muted-foreground"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            )}

                            {!isLive && (
                              <Button 
                                onClick={() => handleDeletePrompt(p.id)}
                                size="xs" 
                                variant="destructive"
                                className="h-7 px-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {p.changeNote && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">
                            Note: {p.changeNote}
                          </p>
                        )}

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>System Instructions Character Count: {p.systemPrompt.length}</span>
                              <Button 
                                onClick={() => {
                                  navigator.clipboard.writeText(p.systemPrompt);
                                  toast.success("Prompt copied to clipboard!");
                                }}
                                size="xs" 
                                variant="outline"
                                className="gap-1 text-[11px]"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </Button>
                            </div>
                            <pre className="p-3 rounded-lg bg-muted/40 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-border/60">
                              {p.systemPrompt}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- MODALS --- */}

      {/* New Prompt Draft Modal */}
      {showNewPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Create New System Prompt Draft
              </h3>
              <button onClick={() => setShowNewPromptModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Prompt Name</label>
                <Input 
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="e.g. VIP Nile Cruise Specialist v2"
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Change Note / Description (Optional)</label>
                <Input 
                  value={newPromptNote}
                  onChange={(e) => setNewPromptNote(e.target.value)}
                  placeholder="e.g. Added strict Dahabiya booking policies & Arabic VIP tone"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">System Prompt Instructions</label>
                <Textarea 
                  rows={9}
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="You are GuideR, the elite luxury travel concierge for Dunas Travel..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button onClick={() => setShowNewPromptModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleCreatePromptDraft} disabled={creatingPromptDraft} variant="gold" size="sm">
                {creatingPromptDraft ? "Creating..." : "Save Draft Version"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prompt Version Modal */}
      {showEditPromptModal && editingPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" /> Edit Prompt Version (v{editingPrompt.versionNumber})
              </h3>
              <button onClick={() => setShowEditPromptModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Prompt Name</label>
                  <Input 
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                    className="font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Status</label>
                  <select
                    value={editingPrompt.status}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, status: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-background border border-border/80 text-xs font-semibold"
                  >
                    <option value="DRAFT">DRAFT (مسودة)</option>
                    <option value="PUBLISHED">PUBLISHED (منشور نشط - مباشر)</option>
                    <option value="ARCHIVED">ARCHIVED (مؤرشف - غير نشط)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Change Notes / Description</label>
                <Input 
                  value={editingPrompt.changeNote || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, changeNote: e.target.value })}
                  placeholder="Notes about this prompt's role or recent edits..."
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase text-muted-foreground">Master System Prompt Instructions</label>
                  <span className="text-[10px] text-muted-foreground">{editingPrompt.systemPrompt.length} characters</span>
                </div>
                <Textarea 
                  rows={10}
                  value={editingPrompt.systemPrompt}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, systemPrompt: e.target.value })}
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button onClick={() => setShowEditPromptModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleUpdatePrompt} disabled={updatingPrompt} variant="gold" size="sm">
                {updatingPrompt ? "Saving..." : "Save Changes to Database (حفظ التعديلات)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add API Key Modal (with Smart ModelSelector & Dynamic Next Priority) */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" /> Add API Key to Failover Pool
                </h3>
                <p className="text-xs text-muted-foreground">
                  إضافة مفتاح API جديد إلى مصفوفة الاستجابة السريعة وتجاوز الفشل.
                </p>
              </div>
              <button onClick={() => setShowAddKeyModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-primary" /> AI Provider (مزود الخدمة)
                </label>
                <select
                  value={newKeyProvider}
                  onChange={(e) => {
                    setNewKeyProvider(e.target.value);
                    const p = SUPPORTED_PROVIDERS.find((x) => x.id === e.target.value);
                    if (p) setNewKeyModel(p.defaultModel);
                  }}
                  className="w-full p-2.5 rounded-xl bg-background border border-border/80 font-bold text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {SUPPORTED_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Smart Model Selector */}
              <ModelSelector
                provider={newKeyProvider}
                value={newKeyModel}
                onChange={setNewKeyModel}
                label="Model Architecture (اختيار أو كتابة الموديل)"
                isAr={true}
              />

              {/* Base URL (for Custom or OpenRouter) */}
              {(newKeyProvider === 'custom' || newKeyProvider === 'openrouter') && (
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Base URL (اختياري)</label>
                  <Input 
                    value={newKeyBaseUrl}
                    onChange={(e) => setNewKeyBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com/v1 or https://openrouter.ai/api/v1"
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* API Secret Key */}
              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">API Secret Key (المفتاح السري)</label>
                <Input 
                  type="password"
                  value={newKeySecret}
                  onChange={(e) => setNewKeySecret(e.target.value)}
                  placeholder="sk-... or AIzaSy..."
                  className="font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Friendly Label */}
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Friendly Label (تسمية توضيحية)</label>
                  <Input 
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. Gemini 2.5 Flash Primary"
                    className="text-xs"
                  />
                </div>

                {/* Priority with auto-increment badge */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold uppercase text-muted-foreground">Priority (الترتيب)</label>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Auto: #{getNextPriority()}
                    </span>
                  </div>
                  <Input 
                    type="number"
                    min={1}
                    max={99}
                    value={newKeyPriority}
                    onChange={(e) => setNewKeyPriority(Number(e.target.value))}
                    className="text-xs font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button onClick={() => setShowAddKeyModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleAddKeyToPool} disabled={addingKey || !newKeySecret.trim()} variant="gold" size="sm" className="font-bold">
                {addingKey ? "Adding Key..." : "Add Key to Pool (إضافة للمصفوفة)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit API Key Modal (Comprehensive Edit Capability) */}
      {showEditKeyModal && editingKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-amber-500" /> Edit API Key & Failover Settings
                </h3>
                <p className="text-xs text-muted-foreground">
                  تعديل اسم الموديل، الأولوية، التسمية، أو استبدال المفتاح السري لهذا العنصر.
                </p>
              </div>
              <button onClick={() => setShowEditKeyModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-primary" /> AI Provider (مزود الخدمة)
                </label>
                <select
                  value={editKeyProvider}
                  onChange={(e) => {
                    setEditKeyProvider(e.target.value);
                    const p = SUPPORTED_PROVIDERS.find((x) => x.id === e.target.value);
                    if (p) setEditKeyModel(p.defaultModel);
                  }}
                  className="w-full p-2.5 rounded-xl bg-background border border-border/80 font-bold text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {SUPPORTED_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Smart Model Selector */}
              <ModelSelector
                provider={editKeyProvider}
                value={editKeyModel}
                onChange={setEditKeyModel}
                label="Model Architecture (الموديل المخصص أو المختار)"
                isAr={true}
              />

              {/* Base URL */}
              {(editKeyProvider === 'custom' || editKeyProvider === 'openrouter') && (
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Base URL (اختياري)</label>
                  <Input 
                    value={editKeyBaseUrl}
                    onChange={(e) => setEditKeyBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com/v1 or https://openrouter.ai/api/v1"
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* Friendly Label & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Friendly Label</label>
                  <Input 
                    value={editKeyLabel}
                    onChange={(e) => setEditKeyLabel(e.target.value)}
                    placeholder="e.g. Claude 3.7 Primary Failover"
                    className="text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Priority (1 = Highest / الأعلى)</label>
                  <Input 
                    type="number"
                    min={1}
                    max={99}
                    value={editKeyPriority}
                    onChange={(e) => setEditKeyPriority(Number(e.target.value))}
                    className="text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <p className="font-bold text-foreground text-xs">Failover Status (حالة المفتاح)</p>
                  <p className="text-[11px] text-muted-foreground">تفعيل المفتاح في مصفوفة الاستجابة أو تعطيله مؤقتاً</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditKeyActive(!editKeyActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    editKeyActive 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' 
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {editKeyActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                  {editKeyActive ? 'Active (نشط ومتاح)' : 'Disabled (معطل)'}
                </button>
              </div>

              {/* Optional Secret Key Replacement */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase text-muted-foreground">Update API Secret Key (اختياري)</label>
                  <span className="text-[10px] text-muted-foreground font-mono">Current: {editingKey.maskedKey}</span>
                </div>
                <Input 
                  type="password"
                  value={editKeySecret}
                  onChange={(e) => setEditKeySecret(e.target.value)}
                  placeholder="اتركه فارغاً للاحتفاظ بالمفتاح الحالي... (Leave blank to keep current key)"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button onClick={() => setShowEditKeyModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleUpdateKeyInPool} disabled={updatingKey} variant="gold" size="sm" className="font-bold">
                {updatingKey ? "Saving Changes..." : "Save Key Changes (حفظ التعديلات)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5-Language AI Ingestion Modal */}
      {showMultiLangModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" /> 5-Language AI Knowledge Generator
                </h3>
                <p className="text-xs text-muted-foreground">
                  Write the content once in your preferred language, and AI will automatically translate and localize all 5 languages.
                </p>
              </div>
              <button onClick={() => setShowMultiLangModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Source Language</label>
                  <select
                    value={sourceLocale}
                    onChange={(e) => setSourceLocale(e.target.value)}
                    className="w-full p-2 rounded-lg bg-background border border-border/80 text-xs font-semibold"
                  >
                    <option value="ar">🇸🇦 Arabic (العربية)</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Spanish (Español)</option>
                    <option value="pt">🇵🇹 Portuguese (Português)</option>
                    <option value="it">🇮🇹 Italian (Italiano)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Category</label>
                  <select
                    value={sourceCategory}
                    onChange={(e) => setSourceCategory(e.target.value)}
                    className="w-full p-2 rounded-lg bg-background border border-border/80 text-xs font-semibold"
                  >
                    <option value="CUSTOM_TOURS">CUSTOM_TOURS (VIP & Packages)</option>
                    <option value="BOOKING_POLICY">BOOKING_POLICY (Payments & Cancellations)</option>
                    <option value="DESTINATION_INFO">DESTINATION_INFO (Guides & Sites)</option>
                    <option value="FAQ">FAQ (General Inquiries)</option>
                    <option value="TRANSPORTATION">TRANSPORTATION (Transfers & Fleet)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Article Title</label>
                <Input 
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. VIP Nile Dahabiya Private Charters & Excursions"
                  className="text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Article Content / Policy</label>
                <Textarea 
                  rows={4}
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Detailed facts, pricing rules, inclusions, and policies..."
                  className="text-xs leading-relaxed"
                />
              </div>

              <Button
                onClick={handleAutoTranslateFiveLanguages}
                disabled={translatingFiveLang || !sourceTitle.trim() || !sourceContent.trim()}
                variant="gold"
                size="sm"
                className="w-full gap-2 font-bold"
              >
                <Languages className={`h-4 w-4 ${translatingFiveLang ? 'animate-spin' : ''}`} />
                {translatingFiveLang ? "AI is Generating 5 Languages..." : "Auto-Generate 5 Languages with AI (توليد الـ 5 لغات بالذكاء الاصطناعي)"}
              </Button>
            </div>

            {/* Step 2: Review & Edit Tabs for each Language */}
            {(translations.ar.title || translations.en.title) && (
              <div className="space-y-3 border-t pt-3">
                <span className="text-xs font-bold uppercase text-emerald-600">Step 2: Review & Edit Localized Versions</span>
                <Tabs value={multiLangActiveTab} onValueChange={setMultiLangActiveTab}>
                  <TabsList className="grid grid-cols-5 h-auto p-1 bg-muted">
                    <TabsTrigger value="ar" className="text-xs font-bold">🇸🇦 AR (عربي)</TabsTrigger>
                    <TabsTrigger value="en" className="text-xs font-bold">🇬🇧 EN (English)</TabsTrigger>
                    <TabsTrigger value="es" className="text-xs font-bold">🇪🇸 ES (Español)</TabsTrigger>
                    <TabsTrigger value="pt" className="text-xs font-bold">🇵🇹 PT (Português)</TabsTrigger>
                    <TabsTrigger value="it" className="text-xs font-bold">🇮🇹 IT (Italiano)</TabsTrigger>
                  </TabsList>

                  {(['ar', 'en', 'es', 'pt', 'it'] as const).map((loc) => (
                    <TabsContent key={loc} value={loc} className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Title ({loc.toUpperCase()})</label>
                        <Input 
                          value={translations[loc]?.title || ''}
                          onChange={(e) => setTranslations({
                            ...translations,
                            [loc]: { ...translations[loc], title: e.target.value }
                          })}
                          className="text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Content ({loc.toUpperCase()})</label>
                        <Textarea 
                          rows={5}
                          value={translations[loc]?.content || ''}
                          onChange={(e) => setTranslations({
                            ...translations,
                            [loc]: { ...translations[loc], content: e.target.value }
                          })}
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button onClick={() => setShowMultiLangModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleSaveBatchMultiLang}
                disabled={savingMultiLang || (!translations.ar.title && !sourceTitle)}
                variant="gold"
                size="sm"
                className="font-bold"
              >
                {savingMultiLang ? "Saving All 5..." : "Save All 5 Languages to RAG (حفظ كافة اللغات)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript & Live Human Takeover Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Live Chat & Takeover Control
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedConversation.status === 'HANDED_OFF' ? 'bg-amber-500/20 text-amber-600' :
                    selectedConversation.status === 'CLOSED' ? 'bg-muted text-muted-foreground' :
                    'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {selectedConversation.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Session: {selectedConversation.publicSessionId} | Visitor: {selectedConversation.visitorName || 'Anonymous'} ({selectedConversation.visitorEmail || 'No email'})
                </p>
              </div>
              <button onClick={() => setSelectedConversation(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Bar for Live Takeover */}
            <div className="flex flex-wrap gap-2 p-2 bg-muted/40 rounded-xl border border-border/60 text-xs">
              <Button onClick={() => handleTakeover(selectedConversation.id)} size="xs" variant="gold" className="gap-1 font-bold">
                <UserCheck className="h-3.5 w-3.5" /> Take Over Chat (Pause AI)
              </Button>
              <Button onClick={() => handleReturnToAi(selectedConversation.id)} size="xs" variant="outline" className="gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Return to AI Concierge
              </Button>
              <Button onClick={() => handleResolve(selectedConversation.id)} size="xs" variant="outline" className="gap-1 text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Resolve & Close Chat
              </Button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-xl max-h-[40vh]">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : m.role === 'staff'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-950 dark:text-amber-100 rounded-tl-xs space-y-1'
                        : 'bg-background border border-border/60 text-foreground rounded-tl-xs space-y-1.5'
                    }`}>
                      {m.role === 'staff' && (
                        <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
                          Dunas Concierge Staff (Human Agent)
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{m.textContent}</p>
                      <span className="text-[10px] text-muted-foreground block text-right">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center py-6 text-muted-foreground">No message transcript found for this session.</p>
              )}
            </div>

            {/* Staff Direct Reply Box */}
            <div className="pt-2 border-t space-y-2 shrink-0">
              <label className="text-xs font-semibold text-muted-foreground">Reply as Concierge Specialist:</label>
              <div className="flex gap-2">
                <Input 
                  value={staffReplyText}
                  onChange={(e) => setStaffReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendStaffReply()}
                  placeholder="Type direct response to visitor..."
                  className="text-xs"
                />
                <Button onClick={handleSendStaffReply} disabled={sendingStaffReply || !staffReplyText.trim()} variant="gold" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Prompt Injection Audit Events Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" /> AI Security & Safety Audit Events
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real-time telemetry log of blocked prompt injections, security pattern detections, and error events.
                </p>
              </div>
              <button onClick={() => setShowSafetyModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2">
              {loadingSafetyEvents ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading safety audit logs...</div>
              ) : safetyEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  No security incidents or blocked attacks recorded. All input streams are healthy!
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Provider / Filter</th>
                        <th className="p-2.5">Session</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {safetyEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-muted/20">
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold font-mono text-[10px]">
                              {evt.errorCategory || 'SECURITY_VIOLATION'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-muted-foreground">{evt.provider} ({evt.model})</td>
                          <td className="p-2.5 font-mono truncate max-w-[140px]">{evt.sessionId || '—'}</td>
                          <td className="p-2.5 text-muted-foreground">{new Date(evt.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={() => setShowSafetyModal(false)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
