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
  FileText, 
  Database, 
  Settings, 
  Activity, 
  Users, 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Search, 
  Layers, 
  Clock, 
  Zap, 
  DollarSign,
  ShieldCheck,
  X
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { aiApi, AiOverviewMetrics, AiConfigData, KnowledgeItemData, ConversationItemData } from "@/features/ai/api/aiApi";

interface SimMessage {
  role: 'user' | 'agent';
  text: string;
  tours?: any[];
}

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
    systemInstructions: 'You are Jaider, a world-class luxury travel concierge for Dunas Travel.',
    salesPersonality: 'Luxury Concierge',
    toneOfVoice: 'Warm, Executive, Helpful',
    fallbackMessage: "I'm sorry, I couldn't find exact details for your request right now.",
    escalationMessage: 'I have notified our senior travel team. A travel specialist will contact you shortly!',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Simulator State
  const [simulatorSessionId] = useState(() => `admin-sim-${Date.now()}`);
  const [simPrompt, setSimPrompt] = useState("");
  const [simLog, setSimLog] = useState<SimMessage[]>([
    { role: 'agent' as const, text: "Hi! 👋 I'm Guider (جايدر), your AI Travel Concierge. How can I assist you with your luxury trip today?" }
  ]);
  const [simTyping, setSimTyping] = useState(false);

  // Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItemData[]>([]);
  const [knowledgeTotal, setKnowledgeTotal] = useState(0);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [knowledgeCategory, setKnowledgeCategory] = useState("");
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadCategory, setUploadCategory] = useState("GENERAL");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Conversations & Leads State
  const [conversations, setConversations] = useState<ConversationItemData[]>([]);
  const [conversationsTotal, setConversationsTotal] = useState(0);
  const [conversationsSearch, setConversationsSearch] = useState("");
  const [conversationsStatus, setConversationsStatus] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemData | null>(null);

  // Fetch Overview Metrics
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await aiApi.getOverview();
      if (res && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err: any) {
      console.warn("Could not fetch AI overview metrics:", err.message);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch Config
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await aiApi.getConfig();
      if (data) {
        setConfig(data);
      }
    } catch (err: any) {
      console.warn("Could not fetch AI config:", err.message);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Fetch Knowledge Base Items
  const fetchKnowledge = async () => {
    setLoadingKnowledge(true);
    try {
      const res = await aiApi.getKnowledge({
        search: knowledgeSearch || undefined,
        category: knowledgeCategory || undefined,
        limit: 20,
      });
      if (res && res.items) {
        setKnowledgeItems(res.items);
        setKnowledgeTotal(res.total || res.items.length);
      }
    } catch (err: any) {
      console.warn("Could not fetch knowledge items:", err.message);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  // Fetch Conversations
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await aiApi.getConversations({
        search: conversationsSearch || undefined,
        status: conversationsStatus || undefined,
        limit: 20,
      });
      if (res && res.items) {
        setConversations(res.items);
        setConversationsTotal(res.total || res.items.length);
      }
    } catch (err: any) {
      console.warn("Could not fetch conversations:", err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchConfig();
    fetchKnowledge();
    fetchConversations();
  }, []);

  // Save AI Config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const payload: Partial<AiConfigData> = {
        ...config,
        apiKey: apiKeyInput ? apiKeyInput : undefined,
      };
      const updated = await aiApi.updateConfig(payload);
      setConfig(updated);
      setApiKeyInput('');
      toast.success(tCommon("success") || "AI Configuration updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  // Test Provider Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await aiApi.testConnection({
        provider: config.provider,
        model: config.model,
        apiKey: apiKeyInput ? apiKeyInput : undefined,
      });
      if (res && res.success) {
        toast.success(`Connection Verified! (${res.latencyMs || 0}ms): ${res.message}`);
      } else {
        toast.error(res.error || res.message || "Provider test failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test failed");
    } finally {
      setTestingConnection(false);
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
        locale: 'en',
      });

      const replyText = res?.message?.content || res?.text || "Response generated.";
      const tours = res?.recommendations?.tours || [];
      setSimLog((prev) => [...prev, { role: 'agent', text: replyText, tours }]);
    } catch (err: any) {
      setSimLog((prev) => [...prev, { role: 'agent', text: `Error: ${err.message || "Simulator call failed."}` }]);
    } finally {
      setSimTyping(false);
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

  // Upload Custom Document
  const handleUploadDocument = async () => {
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      toast.error("Please provide both title and content.");
      return;
    }
    setUploadingDoc(true);
    try {
      const res = await aiApi.uploadKnowledgeDocument({
        title: uploadTitle,
        content: uploadContent,
        category: uploadCategory,
      });
      if (res && res.success) {
        toast.success("Knowledge document ingested successfully!");
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadContent("");
        fetchKnowledge();
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload knowledge document.");
    } finally {
      setUploadingDoc(false);
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tAi("title") || "Guider (جايدر) AI Command Center"}
        description={tAi("description") || "Manage Guider AI sales agent, RAG Knowledge Base, system prompts, live simulator, and customer conversations."}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" /> Overview & Metrics
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" /> Live Guider Simulator
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2 text-xs font-semibold">
            <Settings className="h-3.5 w-3.5" /> AI Prompts & Config
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2 text-xs font-semibold">
            <Database className="h-3.5 w-3.5" /> RAG Knowledge Base & Sync
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" /> Visitor Chats & Leads
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Metrics */}
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">RAG Indexed Articles</p>
                  <p className="text-2xl font-bold mt-1">{metrics?.publishedKnowledgeArticles ?? 0}</p>
                  <span className="text-[11px] text-blue-600 font-medium">Tours & Guides Ingested</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Latency / Cost</p>
                  <p className="text-2xl font-bold mt-1">{metrics?.avgLatencyMs ?? 0} ms</p>
                  <span className="text-[11px] text-purple-600 font-medium">Cost: ${metrics?.estimatedCostUsd ?? '0.0000'}</span>
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
                  Guider System Status
                </CardTitle>
                <CardDescription>Live health & configuration summary of Guider AI Concierge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Public Chat Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">ONLINE & ACTIVE</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Model Provider</span>
                  <span className="font-mono font-bold">{config.provider?.toUpperCase()} ({config.model})</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Sales Personality</span>
                  <span className="font-bold text-primary">{config.salesPersonality}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="font-semibold text-muted-foreground">Catalog Grounding</span>
                  <span className="font-bold text-blue-600">Hybrid DB + RAG Engine</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  Quick Actions & Operations
                </CardTitle>
                <CardDescription>Instant controls for RAG sync and telemetry refresh</CardDescription>
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
                  onClick={() => { fetchOverview(); fetchConfig(); fetchKnowledge(); fetchConversations(); toast.success("Telemetry refreshed!"); }} 
                  className="w-full justify-start gap-2 text-xs"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 text-primary" /> Refresh System Telemetry & Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Guider Simulator */}
        <TabsContent value="simulator" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/80 shadow-xs bg-card flex flex-col h-[600px]">
              <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Guider Interactive Playground
                </CardTitle>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-semibold">
                  Live Grounding Mode
                </span>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {simLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-xs' : 'bg-muted border border-border/60 text-foreground rounded-tl-xs space-y-2'}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.tours && msg.tours.length > 0 && (
                        <div className="pt-2 border-t border-border/40 space-y-2">
                          <p className="text-xs font-bold uppercase text-amber-600">Grounded Tour Recommendations:</p>
                          {msg.tours.map((t: any) => (
                            <div key={t.id} className="p-2 bg-background rounded-lg border border-border/60 text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold">{t.title}</p>
                                <p className="text-[11px] text-muted-foreground">{t.destination} - ${t.price} {t.currency}</p>
                              </div>
                              <a href={t.publicUrl} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">View →</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {simTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-tl-xs p-3.5 text-sm flex gap-1.5 items-center">
                      <span className="text-xs font-medium text-muted-foreground">Guider is thinking...</span>
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-.3s]" />
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border/60 bg-muted/20">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask Guider anything (e.g., Recommend top Nile Cruise tours or cancellation policy)..." 
                    value={simPrompt}
                    onChange={(e) => setSimPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendSimulator()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendSimulator} disabled={simTyping || !simPrompt.trim()} size="sm" variant="gold" className="px-5">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/80 shadow-xs bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Simulator Grounding Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    This simulator sends queries to the NestJS `ChatOrchestratorService` using your configured system prompt and live RAG retrieval.
                  </p>
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <p className="font-bold text-foreground">Session ID:</p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{simulatorSessionId}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <p className="font-bold text-foreground">Active RAG Grounding:</p>
                    <p className="text-emerald-600 font-semibold">{metrics?.publishedKnowledgeArticles ?? 0} Catalog & Knowledge Items Active</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: AI Prompts & Config */}
        <TabsContent value="config" className="m-0">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Guider AI Prompt & Model Configuration</CardTitle>
                <CardDescription>Customize Guider's identity, system prompt instructions, model provider, and escalation messages.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTestConnection} disabled={testingConnection} variant="outline" size="sm">
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>
                <Button onClick={handleSaveConfig} disabled={savingConfig} variant="gold" size="sm">
                  {savingConfig ? "Saving..." : "Save Config"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Provider</label>
                  <Input 
                    value={config.provider || 'anthropic'} 
                    onChange={(e) => setConfig({ ...config, provider: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Model</label>
                  <Input 
                    value={config.model || 'claude-3-5-sonnet-20241022'} 
                    onChange={(e) => setConfig({ ...config, model: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">API Key (Optional Override)</label>
                  <Input 
                    type="password" 
                    placeholder={config.encryptedApiKey ? "••••••••••••••••" : "Enter Anthropic API Key"} 
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sales Personality</label>
                  <Input 
                    value={config.salesPersonality || ''} 
                    onChange={(e) => setConfig({ ...config, salesPersonality: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Tone of Voice</label>
                  <Input 
                    value={config.toneOfVoice || ''} 
                    onChange={(e) => setConfig({ ...config, toneOfVoice: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">System Prompt Instructions</label>
                <Textarea 
                  rows={6}
                  value={config.systemInstructions || ''} 
                  onChange={(e) => setConfig({ ...config, systemInstructions: e.target.value })}
                  className="font-mono text-xs" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Fallback Message</label>
                  <Textarea 
                    rows={2}
                    value={config.fallbackMessage || ''} 
                    onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Escalation / Handoff Message</label>
                  <Textarea 
                    rows={2}
                    value={config.escalationMessage || ''} 
                    onChange={(e) => setConfig({ ...config, escalationMessage: e.target.value })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: RAG Knowledge Base */}
        <TabsContent value="knowledge" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">RAG Knowledge Base & Database Ingestion</CardTitle>
                <CardDescription>Manage RAG documents and sync active database tours/guides to ground Guider responses.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowUploadModal(true)} variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Upload Document
                </Button>
                <Button onClick={handleSyncCatalog} disabled={syncingCatalog} variant="gold" size="sm" className="gap-1.5">
                  <RefreshCw className={`h-4 w-4 ${syncingCatalog ? 'animate-spin' : ''}`} />
                  {syncingCatalog ? "Syncing..." : "Sync DB Catalog to RAG"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input 
                  placeholder="Search knowledge documents by title or content..."
                  value={knowledgeSearch}
                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchKnowledge()}
                  className="max-w-md text-xs"
                />
                <Button onClick={fetchKnowledge} size="sm" variant="outline">
                  <Search className="h-3.5 w-3.5 mr-1" /> Search
                </Button>
              </div>

              {loadingKnowledge ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading Knowledge Base items...</div>
              ) : knowledgeItems.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-2">
                  <Database className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p>No knowledge base items found. Click "Sync DB Catalog to RAG" to ingest active tours!</p>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {knowledgeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="p-3 font-semibold text-foreground max-w-xs truncate">{item.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-muted-foreground">{item.source || 'DB_SYNC'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                              {item.status}
                            </span>
                          </td>
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

        {/* Tab 5: Visitor Chats & Leads */}
        <TabsContent value="conversations" className="m-0 space-y-6">
          <Card className="border-border/80 shadow-xs bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Visitor Conversations & Qualified Leads</CardTitle>
                <CardDescription>Review live visitor chats, human handoff requests, and lead records.</CardDescription>
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
                        <th className="p-3">Contact Email</th>
                        <th className="p-3">Locale</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Lead Score</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {conversations.map((conv) => (
                        <tr key={conv.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <p className="font-bold text-foreground">{conv.visitorName || 'Anonymous Visitor'}</p>
                            <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{conv.publicSessionId}</p>
                          </td>
                          <td className="p-3 font-medium">{conv.visitorEmail || '—'}</td>
                          <td className="p-3 font-mono uppercase font-bold">{conv.locale}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              conv.status === 'HANDED_OFF' ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                            }`}>
                              {conv.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-primary">{conv.leadScore || 0} pts</td>
                          <td className="p-3 text-muted-foreground">{new Date(conv.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <Button onClick={() => handleViewConversation(conv)} size="xs" variant="outline" className="gap-1">
                              <Eye className="h-3 w-3" /> View Transcript
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
      </Tabs>

      {/* Custom Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" /> Upload Custom RAG Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Document Title</label>
                <Input 
                  placeholder="e.g., Cancellation & Payment Policies 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Category</label>
                <Input 
                  placeholder="e.g., POLICY, FAQ, GENERAL"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Document Text / Knowledge Content</label>
                <Textarea 
                  rows={6}
                  placeholder="Paste article, guide, policy text, or tour notes here..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setShowUploadModal(false)} variant="outline" size="sm">Cancel</Button>
              <Button onClick={handleUploadDocument} disabled={uploadingDoc} variant="gold" size="sm">
                {uploadingDoc ? "Ingesting..." : "Ingest Document"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Transcript Inspector Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-border/60 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Transcript: {selectedConversation.visitorName || 'Anonymous Visitor'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">Session ID: {selectedConversation.publicSessionId}</p>
              </div>
              <button onClick={() => setSelectedConversation(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 text-xs ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border/60 text-foreground'
                    }`}>
                      <p className="font-bold text-[10px] uppercase opacity-75 mb-1">{m.role}</p>
                      <p className="whitespace-pre-wrap">{m.textContent || m.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No messages recorded for this session.</p>
              )}
            </div>
            <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end">
              <Button onClick={() => setSelectedConversation(null)} variant="outline" size="sm">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
