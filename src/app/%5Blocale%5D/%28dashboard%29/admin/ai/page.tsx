"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bot, MessageSquare, Send, Database, Settings, Activity, ShieldCheck, Zap, RefreshCw, Plus, Trash2, Edit, Eye, FolderSync } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { aiApi, AiOverviewMetrics, AiConfigData, KnowledgeItemData, ConversationItemData } from "@/features/ai/api/aiApi";

export default function AiAgentsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Overview Data
  const [metrics, setMetrics] = useState<AiOverviewMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Config Data
  const [config, setConfig] = useState<AiConfigData | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Conversations Data
  const [conversations, setConversations] = useState<ConversationItemData[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemData | null>(null);

  // Knowledge Base Data
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItemData[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgeItemData>>({});
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  // Simulator State
  const [simPrompt, setSimPrompt] = useState("");
  const [simSessionId] = useState(() => `sim-${Date.now()}`);
  const [simMessages, setSimMessages] = useState<{ role: 'user' | 'assistant'; text: string; tours?: any[]; sources?: any[]; latency?: number }[]>([
    { role: 'assistant', text: "Hello! I am Jaider AI. Test any prompt here to verify grounded RAG and active tour retrieval." }
  ]);
  const [simLoading, setSimLoading] = useState(false);

  // Load Overview Metrics
  const fetchOverview = async () => {
    setLoadingMetrics(true);
    try {
      const res = await aiApi.getOverview();
      setMetrics(res.metrics);
    } catch {
      toast.error("Failed to load AI overview metrics");
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Load Config
  const fetchConfig = async () => {
    try {
      const res = await aiApi.getConfig();
      setConfig(res);
      setApiKeyInput(res.encryptedApiKey || "");
    } catch {
      toast.error("Failed to load AI configuration");
    }
  };

  // Load Conversations
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await aiApi.getConversations({ limit: 20 });
      setConversations(res.items);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load Knowledge
  const fetchKnowledge = async () => {
    setLoadingKnowledge(true);
    try {
      const res = await aiApi.getKnowledge({ search: knowledgeSearch });
      setKnowledgeItems(res.items);
    } catch {
      toast.error("Failed to load Knowledge Base documents");
    } finally {
      setLoadingKnowledge(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (activeTab === "conversations") fetchConversations();
    if (activeTab === "knowledge") fetchKnowledge();
  }, [activeTab]);

  // Test Provider Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await aiApi.testConnection({
        provider: config?.provider,
        model: config?.model,
        apiKey: apiKeyInput,
      });
      if (res.success) {
        toast.success(`Connection verified successfully! (${res.latencyMs}ms)`);
      } else {
        toast.error(`Connection failed: ${res.message || res.error}`);
      }
    } catch (err: any) {
      toast.error(`Test connection error: ${err.message || 'Server error'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  // Save AI Config
  const handleSaveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      const updated = await aiApi.updateConfig({
        ...config,
        apiKey: apiKeyInput,
      });
      setConfig(updated);
      toast.success("AI Configuration saved successfully!");
    } catch (err: any) {
      toast.error(`Failed to save config: ${err.message || 'Error'}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Run Simulator Message
  const handleSimSend = async () => {
    if (!simPrompt.trim()) return;
    const userText = simPrompt;
    setSimMessages(prev => [...prev, { role: 'user', text: userText }]);
    setSimPrompt("");
    setSimLoading(true);

    try {
      const res = await aiApi.runSimulator({
        message: userText,
        sessionId: simSessionId,
        locale: "en",
      });

      setSimMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.message.content,
          tours: res.recommendations?.tours,
          sources: res.sources,
        }
      ]);
    } catch (err: any) {
      toast.error(`Simulator error: ${err.message || 'Failed'}`);
      setSimMessages(prev => [
        ...prev,
        { role: 'assistant', text: "Error calling backend AI orchestrator." }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  // Save Knowledge Item
  const handleSaveKnowledge = async () => {
    if (!editingKnowledge?.title || !editingKnowledge?.content) {
      toast.error("Please fill in Title and Content");
      return;
    }
    try {
      if (editingKnowledge.id) {
        await aiApi.updateKnowledge(editingKnowledge.id, editingKnowledge);
        toast.success("Knowledge document updated!");
      } else {
        await aiApi.createKnowledge(editingKnowledge);
        toast.success("Knowledge document created!");
      }
      setIsKnowledgeModalOpen(false);
      fetchKnowledge();
    } catch (err: any) {
      toast.error(`Failed to save document: ${err.message}`);
    }
  };

  // Delete Knowledge Item
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge document?")) return;
    try {
      await aiApi.deleteKnowledge(id);
      toast.success("Knowledge document deleted!");
      fetchKnowledge();
    } catch (err: any) {
      toast.error(`Failed to delete document: ${err.message}`);
    }
  };

  // Re-index Knowledge Base
  const handleReindexKnowledge = async () => {
    try {
      const res = await aiApi.reindexKnowledge();
      toast.success(`Re-indexed ${res.reindexedCount} published documents!`);
    } catch (err: any) {
      toast.error(`Re-index failed: ${err.message}`);
    }
  };

  // Sync Database Tours & Destinations to Knowledge Base
  const handleSyncCatalogKnowledge = async () => {
    setSyncingCatalog(true);
    try {
      const res = await aiApi.syncCatalogKnowledge();
      toast.success(`Synced ${res.syncedTours} tours & ${res.syncedDestinations} destinations into RAG Knowledge Base!`);
      fetchKnowledge();
    } catch (err: any) {
      toast.error(`Catalog sync failed: ${err.message}`);
    } finally {
      setSyncingCatalog(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="AI Management Center"
        description="Grounding RAG Engine, Tour Recommendations, Knowledge Management, & Live AI Telemetry"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/60 flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="gap-2 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" /> Overview & Metrics
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5" /> Conversations
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2 text-xs font-semibold">
            <Database className="h-3.5 w-3.5" /> Knowledge Base (RAG)
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2 text-xs font-semibold">
            <Settings className="h-3.5 w-3.5" /> AI Configuration
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" /> Testing Playground
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="m-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Total Conversations</CardDescription>
                <CardTitle className="text-2xl font-bold text-primary">{metrics?.totalConversations ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Active: {metrics?.activeConversations ?? 0} | Handed off: {metrics?.handedOffConversations ?? 0}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Qualified CRM Leads</CardDescription>
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.qualifiedLeads ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Automated visitor lead captures
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Published RAG Knowledge</CardDescription>
                <CardTitle className="text-2xl font-bold text-gold-500">{metrics?.publishedKnowledgeArticles ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Active grounded articles
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Avg Latency & Tokens</CardDescription>
                <CardTitle className="text-2xl font-bold">{metrics?.avgLatencyMs ?? 0} ms</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Total tokens: {metrics?.totalTokens ?? 0} (~${metrics?.estimatedCostUsd ?? 0})
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONVERSATIONS TAB */}
        <TabsContent value="conversations" className="m-0 space-y-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Visitor Conversations</CardTitle>
                <CardDescription className="text-xs">Inspect live visitor chat history, lead qualification scores, and handoff alerts.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchConversations} disabled={loadingConversations}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingConversations ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3">Session / Visitor</th>
                      <th className="p-3">Locale</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Lead Status</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">No conversations recorded yet.</td>
                      </tr>
                    ) : (
                      conversations.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-muted/20">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{c.visitorName || c.publicSessionId.slice(0, 16)}</div>
                            <div className="text-[11px] text-muted-foreground">{c.visitorEmail || c.visitorPhone || 'Anonymous Visitor'}</div>
                          </td>
                          <td className="p-3 font-mono uppercase">{c.locale}</td>
                          <td className="p-3">
                            <Badge variant={c.status === 'HANDED_OFF' ? 'destructive' : c.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={c.leadStatus === 'QUALIFIED' ? 'default' : 'outline'}>
                              {c.leadStatus} ({c.leadScore} pts)
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{new Date(c.updatedAt).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="ghost" onClick={async () => {
                              const detail = await aiApi.getConversationDetail(c.id);
                              setSelectedConversation(detail);
                            }}>
                              <Eye className="h-3.5 w-3.5 mr-1" /> View Transcript
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KNOWLEDGE BASE TAB */}
        <TabsContent value="knowledge" className="m-0 space-y-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Knowledge Base Documents (RAG)</CardTitle>
                <CardDescription className="text-xs">Manage authoritative knowledge articles, policies, FAQs, and travel advice used by the AI chatbot.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSyncCatalogKnowledge} disabled={syncingCatalog}>
                  <FolderSync className={`h-3.5 w-3.5 mr-1 ${syncingCatalog ? 'animate-spin' : ''}`} /> {syncingCatalog ? "Syncing..." : "Sync DB Catalog to RAG"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleReindexKnowledge}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-index All
                </Button>
                <Button size="sm" variant="gold" onClick={() => {
                  setEditingKnowledge({ title: "", content: "", category: "GENERAL", locale: "en", status: "PUBLISHED", priority: 0 });
                  setIsKnowledgeModalOpen(true);
                }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search Knowledge Base..."
                  value={knowledgeSearch}
                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchKnowledge()}
                  className="max-w-sm text-xs"
                />
                <Button size="sm" variant="secondary" onClick={fetchKnowledge}>Search</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Locale</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {knowledgeItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">No knowledge base documents found. Click "Sync DB Catalog to RAG" to ingest database tours and destinations.</td>
                      </tr>
                    ) : (
                      knowledgeItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 font-semibold">{item.title}</td>
                          <td className="p-3 font-mono">{item.category}</td>
                          <td className="p-3 font-mono uppercase">{item.locale}</td>
                          <td className="p-3">
                            <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>{item.status}</Badge>
                          </td>
                          <td className="p-3 font-semibold">{item.priority}</td>
                          <td className="p-3 text-right flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingKnowledge(item); setIsKnowledgeModalOpen(true); }}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteKnowledge(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI CONFIGURATION TAB */}
        <TabsContent value="config" className="m-0 space-y-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> AI Provider & System Settings
              </CardTitle>
              <CardDescription className="text-xs">Configure AI providers, API keys, system rules, sales personality, and fallback messages.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Active AI Provider</label>
                  <Select value={config?.provider || 'anthropic'} onValueChange={(val: string | null) => val && setConfig(prev => prev ? ({ ...prev, provider: val }) : null)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic (Claude 3.5 Sonnet / Haiku)</SelectItem>
                      <SelectItem value="openai" disabled>OpenAI (GPT-4o) - Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Model Identifier</label>
                  <Input
                    value={config?.model || ''}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, model: e.target.value }) : null)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Provider API Key (Masked)</label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter provider API key..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="text-xs font-mono flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={handleTestConnection} disabled={testingConnection}>
                      <Zap className="h-3.5 w-3.5 mr-1" /> {testingConnection ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">System Instructions & Prompt Grounding Rules</label>
                  <Textarea
                    rows={6}
                    value={config?.systemInstructions || ''}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, systemInstructions: e.target.value }) : null)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sales Personality</label>
                  <Input
                    value={config?.salesPersonality || ''}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, salesPersonality: e.target.value }) : null)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Tone of Voice</label>
                  <Input
                    value={config?.toneOfVoice || ''}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, toneOfVoice: e.target.value }) : null)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Fallback Message</label>
                  <Textarea
                    rows={2}
                    value={config?.fallbackMessage || ''}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, fallbackMessage: e.target.value }) : null)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button size="sm" variant="gold" onClick={handleSaveConfig} disabled={savingConfig}>
                  {savingConfig ? "Saving..." : "Save AI Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TESTING PLAYGROUND TAB */}
        <TabsContent value="simulator" className="m-0 space-y-6">
          <Card className="border-border/80 bg-card flex flex-col h-[600px]">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Live AI Simulator & Grounding Playground
              </CardTitle>
              <CardDescription className="text-xs">Tests the real NestJS AI Orchestrator pipeline, checking Grounded RAG Sources & Active Tour Catalog Retrieval.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {simMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-4 text-xs space-y-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-xs' : 'bg-muted rounded-tl-xs'}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Grounded Tour Cards */}
                    {msg.tours && msg.tours.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <span className="font-semibold text-[11px] text-gold-500 uppercase">Grounded Tours Retrieved:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.tours.map((t) => (
                            <div key={t.id} className="bg-background/80 p-2.5 rounded-lg border text-[11px]">
                              <div className="font-bold text-foreground">{t.title}</div>
                              <div className="text-muted-foreground">{t.destination} • ${t.price} {t.currency}</div>
                              <a href={t.publicUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold block mt-1">View Tour Page →</a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RAG Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-primary">RAG Sources Used:</span> {msg.sources.map((s) => s.title).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {simLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl p-3 text-xs flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t bg-muted/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Test prompt e.g. Recommend a 5-day Nile Cruise package or ask about cancellation policies..."
                  value={simPrompt}
                  onChange={(e) => setSimPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSimSend()}
                  className="flex-1 text-xs"
                />
                <Button onClick={handleSimSend} size="sm" variant="gold" className="px-5">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KNOWLEDGE BASE MODAL */}
      {isKnowledgeModalOpen && (
        <Dialog open={isKnowledgeModalOpen} onOpenChange={setIsKnowledgeModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingKnowledge?.id ? "Edit Knowledge Document" : "Create Knowledge Document"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Title</label>
                <Input value={editingKnowledge?.title || ''} onChange={(e) => setEditingKnowledge(prev => ({ ...prev, title: e.target.value }))} className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Category</label>
                  <Select value={editingKnowledge?.category || 'GENERAL'} onValueChange={(val: string | null) => val && setEditingKnowledge(prev => ({ ...prev, category: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="COMPANY">Company</SelectItem>
                      <SelectItem value="FAQ">FAQ</SelectItem>
                      <SelectItem value="BOOKING_POLICY">Booking Policy</SelectItem>
                      <SelectItem value="CANCELLATION_POLICY">Cancellation Policy</SelectItem>
                      <SelectItem value="VISA_GUIDANCE">Visa Guidance</SelectItem>
                      <SelectItem value="DESTINATION_INFO">Destination Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Locale</label>
                  <Select value={editingKnowledge?.locale || 'en'} onValueChange={(val: string | null) => val && setEditingKnowledge(prev => ({ ...prev, locale: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (en)</SelectItem>
                      <SelectItem value="ar">Arabic (ar)</SelectItem>
                      <SelectItem value="es">Spanish (es)</SelectItem>
                      <SelectItem value="pt">Portuguese (pt)</SelectItem>
                      <SelectItem value="it">Italian (it)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Content</label>
                <Textarea rows={6} value={editingKnowledge?.content || ''} onChange={(e) => setEditingKnowledge(prev => ({ ...prev, content: e.target.value }))} className="text-xs font-mono" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsKnowledgeModalOpen(false)}>Cancel</Button>
              <Button variant="gold" size="sm" onClick={handleSaveKnowledge}>Save Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CONVERSATION TRANSCRIPT MODAL */}
      {selectedConversation && (
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Transcript: {selectedConversation.visitorName || selectedConversation.publicSessionId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
              <div className="text-xs border p-3 rounded bg-muted/20 grid grid-cols-2 gap-2">
                <div><strong>Email:</strong> {selectedConversation.visitorEmail || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedConversation.visitorPhone || 'N/A'}</div>
                <div><strong>Locale:</strong> {selectedConversation.locale}</div>
                <div><strong>Lead Status:</strong> {selectedConversation.leadStatus} ({selectedConversation.leadScore} pts)</div>
              </div>

              <div className="space-y-3">
                {selectedConversation.messages?.map((m: any) => (
                  <div key={m.id} className={`p-3 rounded-lg text-xs ${m.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    <div className="font-bold uppercase text-[10px] text-muted-foreground mb-1">{m.role} • {new Date(m.createdAt).toLocaleTimeString()}</div>
                    <p className="whitespace-pre-line">{m.textContent}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
