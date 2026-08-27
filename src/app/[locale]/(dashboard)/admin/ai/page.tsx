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
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
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
      console.warn("Failed to fetch feedback:", err);
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
        priority: Number(newKeyPriority) || 1,
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
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || "Failed to send staff reply.");
    } finally {
      setSendingStaffReply(false);
    }
  };

  // Return to AI
  const handleReturnToAi = async (id: string) => {
    try {
      await aiApi.returnToAi(id);
      toast.success("Conversation returned to AI concierge.");
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
      toast.success("Conversation closed and marked resolved.");
      fetchConversations();
      if (selectedConversation && selectedConversation.id === id) {
        const detail = await aiApi.getConversationDetail(id);
        setSelectedConversation(detail);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve conversation.");
    }
  };

  // --- Prompt Version Lifecycle Handlers ---

  const handleCreatePromptDraft = async () => {
    if (!newPromptName.trim() || !newPromptText.trim()) {
      toast.error("Please enter a prompt name and system instructions.");
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

  const handleOpenEditPrompt = (p: PromptVersionItem) => {
    setEditingPrompt({ ...p });
    setShowEditPromptModal(true);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !editingPrompt.name.trim() || !editingPrompt.systemPrompt.trim()) {
      toast.error("Please enter a prompt name and system instructions.");
      return;
    }
    setUpdatingPrompt(true);
    try {
      await aiApi.updatePromptVersion(editingPrompt.id, {
        name: editingPrompt.name.trim(),
        systemPrompt: editingPrompt.systemPrompt.trim(),
        changeNote: editingPrompt.changeNote?.trim() || undefined,
        status: editingPrompt.status,
      });
      toast.success("Prompt version updated successfully!");
      setShowEditPromptModal(false);
      setEditingPrompt(null);
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to update prompt version.");
    } finally {
      setUpdatingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this prompt version?")) return;
    try {
      await aiApi.deletePromptVersion(id);
      toast.success("Prompt version deleted.");
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete prompt version.");
    }
  };

  const handleArchivePrompt = async (id: string) => {
    try {
      await aiApi.archivePromptVersion(id);
      toast.success("Prompt version archived (inactive).");
      fetchPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive prompt version.");
    }
  };

  const handlePublishPrompt = async (id: string) => {
    try {
      await aiApi.publishPromptVersion(id);
      toast.success("Prompt version published live as active AI system instructions!");
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish prompt version.");
    }
  };

  const handleRollbackPrompt = async (id: string) => {
    try {
      await aiApi.rollbackPromptVersion(id);
      toast.success("Rolled back to this prompt version.");
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to rollback prompt version.");
    }
  };

  const handleSeedDefaultPrompts = async () => {
    setSeedingPrompts(true);
    try {
      await aiApi.seedDefaultPrompts();
      toast.success("Curated luxury prompt templates restored successfully!");
      fetchPrompts();
      fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Failed to seed default prompts.");
    } finally {
      setSeedingPrompts(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tAi("title") || "GuideR (جايدر) AI Command Center"}
        description={tAi("description") || "Enterprise multi-provider AI engine, multi-key failover pool, 5-language RAG knowledge generator, and live sales telemetry."}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" /> Overview & Metrics
          </TabsTrigger>
          <TabsTrigger value="keys" className="gap-2 text-xs font-semibold">
            <Key className="h-3.5 w-3.5" /> Multi-Key Pool ({keyPool.length})
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2 text-xs font-semibold">
            <Settings className="h-3.5 w-3.5" /> Core Prompts & Personality
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2 text-xs font-semibold">
            <Database className="h-3.5 w-3.5" /> 5-Lang RAG Store ({metrics?.publishedKnowledgeArticles || 0})
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" /> Live Visitor Chats ({metrics?.totalConversations || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> Analytics & FinOps
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2 text-xs font-semibold">
            <FileCode className="h-3.5 w-3.5" /> Prompt Versions ({promptVersions.length})
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2 text-xs font-semibold">
            <ThumbsUp className="h-3.5 w-3.5" /> Feedback ({feedbackSummary.total})
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" /> Testing Playground
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Performance Metrics */}
        <TabsContent value="overview" className="m-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Conversations</p>
                  <p className="text-2xl font-bold mt-1">{metrics?.totalConversations ?? 0}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Active: {metrics?.activeConversations ?? 0}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Qualified Leads</p>
                  <p className="text-2xl font-bold mt-1">{metrics?.qualifiedLeads ?? 0}</p>
                  <span className="text-[11px] text-amber-600 font-medium">Handoffs: {metrics?.handedOffConversations ?? 0}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Failover Pool</p>
                  <p className="text-2xl font-bold mt-1">{keyPool.length} Keys</p>
                  <span className="text-[11px] text-emerald-600 font-medium">{keyPool.filter((k) => k.isActive).length} Active & Failover Ready</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Latency / Cost</p>
                  <p className="text-2xl font-bold mt-1">{metrics?.avgLatencyMs ?? 0} ms</p>
                  <span className="text-[11px] text-purple-600 font-medium">Est. Cost: ${metrics?.estimatedCostUsd ?? '0.0000'}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  GuideR Engine Status
                </CardTitle>
                <CardDescription>Live multi-provider resilience and system health status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Public GuideR Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">ONLINE & PROTECTED</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Active Primary Provider</span>
                  <span className="font-mono font-bold uppercase text-primary">{config.provider} ({config.model})</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Failover Circuit Breaker</span>
                  <span className="font-bold text-emerald-600">Zero-Latency Instant Fallback Enabled</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">RAG Catalog Grounding</span>
                  <span className="font-bold text-blue-600">5-Language Synchronized DB Store</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  Instant Operations
                </CardTitle>
                <CardDescription>Direct control actions for RAG sync and telemetry refresh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleSyncCatalog} 
                  disabled={syncingCatalog} 
                  className="w-full justify-start gap-2 text-xs font-semibold"
                  variant="gold"
                >
                  <RefreshCw className={`h-4 w-4 ${syncingCatalog ? 'animate-spin' : ''}`} />
                  {syncingCatalog ? "Syncing Database Tours to RAG..." : "Sync Database Tours & Guides into RAG Store"}
                </Button>
                <Button 
                  onClick={() => setShowMultiLangModal(true)} 
                  className="w-full justify-start gap-2 text-xs"
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

        {/* Tab 2: Multi-API Key Failover Pool */}
        <TabsContent value="keys" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" /> Multi-API Key Failover Pool & Provider Routing
                </CardTitle>
                <CardDescription>
                  Configure multiple API keys across Anthropic, OpenAI, Google Gemini, OpenRouter (Chinese models), and DeepSeek. The system rotates and fails over instantly with zero latency if any key is exhausted.
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddKeyModal(true)} variant="gold" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add API Key to Pool
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKeyPool ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading API Key Pool...</div>
              ) : keyPool.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-3">
                  <Key className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">No API keys configured in the failover pool.</p>
                  <p className="text-[11px]">Add your Anthropic, OpenAI, Gemini, or OpenRouter/DeepSeek keys to enable seamless failover redundancy.</p>
                  <Button onClick={() => setShowAddKeyModal(true)} variant="gold" size="sm">
                    Add First API Key
                  </Button>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Provider & Model</th>
                        <th className="p-3">Masked Secret Key</th>
                        <th className="p-3">Health Status</th>
                        <th className="p-3">Latency</th>
                        <th className="p-3">Failures</th>
                        <th className="p-3">Active</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {keyPool.map((k) => (
                        <tr key={k.id} className="hover:bg-muted/20">
                          <td className="p-3 font-bold">#{k.priority}</td>
                          <td className="p-3">
                            <p className="font-bold text-foreground capitalize">{k.provider}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{k.model}</p>
                            {k.label && <span className="text-[10px] text-primary font-semibold">{k.label}</span>}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{k.maskedKey}</td>
                          <td className="p-3">
                            {k.lastStatus === 'HEALTHY' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1 w-max">
                                <CheckCircle2 className="h-3 w-3" /> HEALTHY
                              </span>
                            )}
                            {k.lastStatus === 'RATE_LIMITED' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px] flex items-center gap-1 w-max">
                                <AlertTriangle className="h-3 w-3" /> RATE LIMITED (429)
                              </span>
                            )}
                            {k.lastStatus === 'FAILED' && (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 font-bold text-[10px] flex items-center gap-1 w-max">
                                <XCircle className="h-3 w-3" /> FAILED
                              </span>
                            )}
                            {k.lastStatus === 'UNTESTED' && (
                              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                                UNTESTED
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono">{k.lastLatencyMs ? `${k.lastLatencyMs} ms` : '—'}</td>
                          <td className="p-3 font-semibold">{k.failCount}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${k.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                              {k.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <Button 
                              onClick={() => handleTestKey(k.id)} 
                              disabled={testingKeyId === k.id} 
                              size="xs" 
                              variant="outline"
                            >
                              <Play className={`h-3 w-3 ${testingKeyId === k.id ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteKey(k.id)} 
                              size="xs" 
                              variant="destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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

        {/* Tab 3: Core Prompts & Personality */}
        <TabsContent value="config" className="m-0 space-y-6">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Default Model</label>
                  <Input 
                    value={config.model || ''}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="text-xs font-mono font-semibold"
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
                <Button onClick={fetchKnowledge} size="sm" variant="outline">
                  <Search className="h-3.5 w-3.5 mr-1" /> Search
                </Button>
              </div>

              {loadingKnowledge ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading Knowledge Base items...</div>
              ) : knowledgeItems.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-2">
                  <Database className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p>No knowledge base items found. Click "Add 5-Language Article" or "Sync DB Catalog".</p>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Locale</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {knowledgeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-muted uppercase">
                              {item.locale}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-foreground max-w-xs truncate">{item.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-muted-foreground">{item.source || 'DB_SYNC'}</td>
                          <td className="p-3 font-bold">{item.priority}</td>
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

        {/* Tab 5: Visitor Chats, Live Takeover & Leads */}
        <TabsContent value="conversations" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Visitor Conversations, Live Takeover & Leads</CardTitle>
                <CardDescription>Review live visitor chats, take over conversations as a human agent, and manage leads.</CardDescription>
              </div>
              <Button onClick={fetchConversations} size="sm" variant="outline" className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh List
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input 
                  placeholder="Search by visitor name, email, phone, or session ID..."
                  value={conversationsSearch}
                  onChange={(e) => setConversationsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                  className="max-w-md text-xs"
                />
                <Button onClick={fetchConversations} size="sm" variant="outline">
                  <Search className="h-3.5 w-3.5 mr-1" /> Search
                </Button>
              </div>

              {loadingConversations ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-2">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p>No visitor conversations recorded yet.</p>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Session / Visitor</th>
                        <th className="p-3">Contact Details</th>
                        <th className="p-3">Locale</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Lead Score</th>
                        <th className="p-3">Created</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {conversations.map((conv) => (
                        <tr key={conv.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <p className="font-bold text-foreground">{conv.visitorName || 'Anonymous Visitor'}</p>
                            <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{conv.publicSessionId}</p>
                          </td>
                          <td className="p-3 font-medium">
                            <p>{conv.visitorEmail || '—'}</p>
                            {conv.visitorPhone && <p className="text-[11px] text-muted-foreground">{conv.visitorPhone}</p>}
                          </td>
                          <td className="p-3 font-mono uppercase font-bold">{conv.locale}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              conv.status === 'HANDED_OFF' ? 'bg-amber-500/20 text-amber-600' :
                              conv.status === 'CLOSED' ? 'bg-muted text-muted-foreground' :
                              'bg-emerald-500/10 text-emerald-600'
                            }`}>
                              {conv.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-primary">{conv.leadScore || 0} pts</td>
                          <td className="p-3 text-muted-foreground">{new Date(conv.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right space-x-1.5">
                            <Button onClick={() => handleViewConversation(conv)} size="xs" variant="outline" className="gap-1">
                              <Eye className="h-3 w-3" /> Live Takeover & Transcript
                            </Button>
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

        {/* Tab 6: Testing Playground Simulator */}
        <TabsContent value="simulator" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" /> Live AI Concierge Simulator
              </CardTitle>
              <CardDescription>
                Test real-time conversation flows, grounded tour matching, policy answers, and security rejection in a sandboxed session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={simLocale}
                  onChange={(e) => setSimLocale(e.target.value)}
                  className="p-2 rounded-lg bg-muted border border-border/80 text-xs font-semibold"
                >
                  <option value="ar">🇸🇦 Arabic (ar)</option>
                  <option value="en">🇬🇧 English (en)</option>
                  <option value="es">🇪🇸 Spanish (es)</option>
                  <option value="pt">🇵🇹 Portuguese (pt)</option>
                  <option value="it">🇮🇹 Italian (it)</option>
                </select>
                <Button 
                  onClick={() => {
                    setSimLog([{ role: 'agent', text: "أهلاً بك! 👋 أنا جايدر (GuideR)، كيف أساعدك اليوم؟" }]);
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  Reset Session
                </Button>
              </div>

              <div className="h-80 overflow-y-auto p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                {simLog.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-xs' : 'bg-background border border-border/60 text-foreground rounded-tl-xs space-y-2'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.tours && m.tours.length > 0 && (
                        <div className="pt-1 space-y-1">
                          <p className="font-bold text-primary">Matched Catalog Tours:</p>
                          {m.tours.map((t: any) => (
                            <div key={t.id} className="p-1.5 bg-muted rounded-md text-[11px]">
                              <p className="font-bold">{t.title} (${t.price} {t.currency})</p>
                              {t.matchReasons && <p className="text-muted-foreground">{t.matchReasons.join(', ')}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {simTyping && (
                  <div className="text-xs text-muted-foreground animate-pulse">GuideR is typing...</div>
                )}
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message (e.g. 'عايز رحلة نايل كروز 8 أيام' or 'What is your refund policy?')..."
                  value={simPrompt}
                  onChange={(e) => setSimPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSimulator()}
                  className="text-xs"
                />
                <Button onClick={handleSendSimulator} disabled={simTyping || !simPrompt.trim()} variant="gold" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics & FinOps */}
        <TabsContent value="analytics" className="m-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead Conversion Rate</p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-500">{analyticsData?.summary?.conversionRate || 0}%</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{analyticsData?.summary?.qualifiedLeadsCount || 0} qualified CRM leads</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Traveler Satisfaction</p>
                  <h3 className="text-2xl font-bold mt-1 text-gold-400">{analyticsData?.summary?.satisfactionRate || 100}%</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{analyticsData?.feedbackSummary?.positive || 0} positive ratings</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
                  <ThumbsUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Latency (P50/P95)</p>
                  <h3 className="text-2xl font-bold mt-1 text-sky-400">{analyticsData?.summary?.avgLatencyMs || 0}ms</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">End-to-end response time</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated AI Cost</p>
                  <h3 className="text-2xl font-bold mt-1 text-amber-400">${analyticsData?.summary?.totalCostUsd?.toFixed(4) || "0.0000"}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{((analyticsData?.summary?.totalTokens || 0) / 1000).toFixed(1)}k tokens used</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-400" /> FinOps Provider Cost Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Usage and cost telemetry aggregated across all configured AI providers and models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData?.providerBreakdown && analyticsData.providerBreakdown.length > 0 ? (
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Model</th>
                        <th className="p-3">Total Requests</th>
                        <th className="p-3">Total Tokens</th>
                        <th className="p-3">Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {analyticsData.providerBreakdown.map((p, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-3 font-semibold">{p.provider}</td>
                          <td className="p-3 font-mono text-muted-foreground">{p.model}</td>
                          <td className="p-3">{p.requestCount}</td>
                          <td className="p-3">{p.totalTokens.toLocaleString()}</td>
                          <td className="p-3 font-bold text-amber-400">${p.costUsd.toFixed(5)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No provider logs recorded yet. Run requests through the testing playground or public widget to gather FinOps telemetry.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Prompt Versions & Rollback */}
        <TabsContent value="prompts" className="m-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" /> Prompt Version Control & Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage, edit, publish, or archive luxury system prompts for AI Concierge, Itinerary Builder, and Translations.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                onClick={handleSeedDefaultPrompts} 
                disabled={seedingPrompts} 
                variant="outline" 
                size="sm" 
                className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <Sparkles className={`h-3.5 w-3.5 ${seedingPrompts ? 'animate-spin' : ''}`} />
                {seedingPrompts ? "Restoring Defaults..." : "Restore Ready Templates (??????? ???????)"}
              </Button>
              <Button onClick={() => setShowNewPromptModal(true)} variant="gold" size="sm" className="gap-1.5 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Create Draft Version
              </Button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/70">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search prompts by title or keyword..."
                value={promptSearch}
                onChange={(e) => setPromptSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {[
                { id: "ALL", label: "All Prompts" },
                { id: "PUBLISHED", label: "Published (Active)" },
                { id: "DRAFT", label: "Drafts" },
                { id: "ARCHIVED", label: "Archived (Inactive)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPromptFilterStatus(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    promptFilterStatus === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background border border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts Cards List */}
          <Card className="border-border/80 shadow-xs bg-card">
            <CardContent className="p-0">
              {(() => {
                const filtered = promptVersions.filter((v) => {
                  const matchesSearch = !promptSearch.trim() || 
                    v.name.toLowerCase().includes(promptSearch.toLowerCase()) || 
                    v.systemPrompt.toLowerCase().includes(promptSearch.toLowerCase()) ||
                    (v.changeNote && v.changeNote.toLowerCase().includes(promptSearch.toLowerCase()));
                  const matchesStatus = promptFilterStatus === "ALL" || v.status === promptFilterStatus;
                  return matchesSearch && matchesStatus;
                });

                if (loadingPrompts) {
                  return (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                      Loading versioned system prompts...
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                      <FileCode className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p>No prompts found matching your filter.</p>
                      <Button onClick={handleSeedDefaultPrompts} variant="outline" size="xs" className="mt-2 text-xs">
                        Restore Curated Luxury Prompts
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-border/60 text-xs">
                    {filtered.map((v) => {
                      const isExpanded = expandedPromptId === v.id;
                      const isPublished = v.status === 'PUBLISHED';
                      const isArchived = v.status === 'ARCHIVED';
                      const isDraft = v.status === 'DRAFT';

                      return (
                        <div key={v.id} className="p-4.5 space-y-3 hover:bg-muted/20 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground">{v.name}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                                  v{v.versionNumber}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                    isPublished
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                      : isDraft
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                      : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30"
                                  }`}
                                >
                                  {isPublished ? "? ACTIVE / PUBLISHED" : isDraft ? "DRAFT" : "ARCHIVED / INACTIVE"}
                                </span>
                              </div>
                              {v.changeNote && (
                                <p className="text-muted-foreground text-xs">{v.changeNote}</p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                              <Button
                                onClick={() => setExpandedPromptId(isExpanded ? null : v.id)}
                                variant="outline"
                                size="xs"
                                className="h-7 px-2 text-[11px] gap-1"
                              >
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {isExpanded ? "Collapse" : "Preview"}
                              </Button>

                              <Button
                                onClick={() => handleOpenEditPrompt(v)}
                                variant="outline"
                                size="xs"
                                className="h-7 px-2 text-[11px] gap-1 hover:text-amber-500"
                              >
                                <Edit3 className="h-3 w-3" /> Edit
                              </Button>

                              {!isPublished && (
                                <Button
                                  onClick={() => handlePublishPrompt(v.id)}
                                  variant="gold"
                                  size="xs"
                                  className="h-7 px-2.5 text-[11px] font-bold"
                                >
                                  Publish Live
                                </Button>
                              )}

                              {!isArchived && !isPublished && (
                                <Button
                                  onClick={() => handleArchivePrompt(v.id)}
                                  variant="outline"
                                  size="xs"
                                  className="h-7 px-2 text-[11px] gap-1 text-slate-500 hover:text-slate-700"
                                  title="Archive (Disable from active use)"
                                >
                                  <Archive className="h-3 w-3" /> Archive
                                </Button>
                              )}

                              {isArchived && (
                                <Button
                                  onClick={() => handleRollbackPrompt(v.id)}
                                  variant="outline"
                                  size="xs"
                                  className="h-7 px-2 text-[11px] gap-1 text-blue-500 hover:text-blue-600"
                                >
                                  <RotateCcw className="h-3 w-3" /> Restore & Publish
                                </Button>
                              )}

                              <Button
                                onClick={() => handleDeletePrompt(v.id)}
                                variant="outline"
                                size="xs"
                                className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                                title="Delete prompt version"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Preview snippet or Full text */}
                          {isExpanded ? (
                            <div className="mt-2 p-3.5 rounded-lg bg-muted/40 border border-border/80 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
                              {v.systemPrompt}
                            </div>
                          ) : (
                            <p className="font-mono text-[10px] text-muted-foreground/80 truncate max-w-3xl">
                              {v.systemPrompt.slice(0, 160)}...
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Traveler Feedback Inspector */}
        <TabsContent value="feedback" className="m-0 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-primary" /> Traveler Ratings & Satisfaction
              </h3>
              <p className="text-xs text-muted-foreground">
                Inspect visitor message ratings, negative feedback categories, and recommendations refinement insights.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-muted/60 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span className="text-emerald-500">👍 {feedbackSummary.positive} Positive</span>
              <span className="text-rose-500">👎 {feedbackSummary.negative} Negative</span>
              <span className="text-gold-400 font-bold">★ {feedbackSummary.satisfactionRate}% Score</span>
            </div>
          </div>

          <Card className="border-border/80 shadow-xs bg-card">
            <CardContent className="p-0">
              {feedbackList.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <ThumbsUp className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  No feedback ratings recorded yet. Visitor ratings will appear here in real-time.
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Traveler Comments</th>
                        <th className="p-3">Visitor / Locale</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {feedbackList.map((f) => (
                        <tr key={f.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            {f.rating === 1 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                                <ThumbsUp className="h-3.5 w-3.5" /> Helpful (+1)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                                <ThumbsDown className="h-3.5 w-3.5" /> Unhelpful (-1)
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-muted font-mono text-[10px]">
                              {f.category || 'GENERAL'}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground italic">{f.comments || '—'}</td>
                          <td className="p-3 font-semibold">{f.conversation?.visitorName || 'Guest'} ({f.locale?.toUpperCase()})</td>
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
      </Tabs>

      {/* Create Draft Prompt Modal */}
      {showNewPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" /> Create New System Prompt Draft
              </h3>
              <button onClick={() => setShowNewPromptModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Prompt Version Name</label>
                <Input 
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="e.g. Luxury Nile Cruise & VIP Sales Concierge"
                  className="font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Change Summary / Description</label>
                <Input 
                  value={newPromptNote}
                  onChange={(e) => setNewPromptNote(e.target.value)}
                  placeholder="e.g. Refined pricing guardrails, added 5-language luxury etiquette."
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase text-muted-foreground">Master System Prompt Instructions</label>
                  <span className="text-[10px] text-muted-foreground">{newPromptText.length} characters</span>
                </div>
                <Textarea 
                  rows={9}
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="You are GuideR (?????), the luxury AI travel concierge..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button onClick={() => setShowNewPromptModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleCreatePromptDraft} disabled={creatingPromptDraft} variant="gold" size="sm">
                {creatingPromptDraft ? "Saving..." : "Save Draft to Database"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Existing Prompt Modal */}
      {showEditPromptModal && editingPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" /> Edit System Prompt (v{editingPrompt.versionNumber})
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
                    <option value="DRAFT">DRAFT (?????)</option>
                    <option value="PUBLISHED">PUBLISHED (???? ??? - ???)</option>
                    <option value="ARCHIVED">ARCHIVED (????? - ??? ???)</option>
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
                {updatingPrompt ? "Saving..." : "Save Changes to Database (??? ?????????)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" /> Add API Key to Failover Pool
              </h3>
              <button onClick={() => setShowAddKeyModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Provider</label>
                <select
                  value={newKeyProvider}
                  onChange={(e) => {
                    setNewKeyProvider(e.target.value);
                    const p = SUPPORTED_PROVIDERS.find((x) => x.id === e.target.value);
                    if (p) setNewKeyModel(p.defaultModel);
                  }}
                  className="w-full p-2 rounded-lg bg-background border border-border/80 font-semibold"
                >
                  {SUPPORTED_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">Model Name</label>
                <Input 
                  value={newKeyModel}
                  onChange={(e) => setNewKeyModel(e.target.value)}
                  placeholder="e.g. claude-3-5-sonnet-20241022, deepseek/deepseek-chat, gpt-4o"
                />
              </div>

              {(newKeyProvider === 'custom' || newKeyProvider === 'openrouter') && (
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Base URL (Optional)</label>
                  <Input 
                    value={newKeyBaseUrl}
                    onChange={(e) => setNewKeyBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com/v1 or https://openrouter.ai/api/v1"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold uppercase text-muted-foreground">API Secret Key</label>
                <Input 
                  type="password"
                  value={newKeySecret}
                  onChange={(e) => setNewKeySecret(e.target.value)}
                  placeholder="sk-..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Friendly Label</label>
                  <Input 
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. Primary Anthropic Key"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-muted-foreground">Priority (1 = Highest)</label>
                  <Input 
                    type="number"
                    min={1}
                    max={99}
                    value={newKeyPriority}
                    onChange={(e) => setNewKeyPriority(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setShowAddKeyModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleAddKeyToPool} disabled={addingKey} variant="gold" size="sm">
                {addingKey ? "Adding..." : "Add Key"}
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
