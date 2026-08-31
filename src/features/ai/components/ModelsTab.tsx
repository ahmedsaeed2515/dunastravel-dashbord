"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Plus,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowUpDown,
  Trash2,
  Edit3,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  Clock,
  DollarSign,
  X,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  Server,
  Key,
  Flame,
  Globe2,
  ShieldAlert,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  ApiKeyPoolEntry,
  ModelCapabilityItem,
  ProviderRegistryItem,
  ProviderTestResult,
  RoutingPolicyData,
  DiscoveredModelItem,
  aiApi,
} from "../api/aiApi";
import { ModelSelector } from "./ModelSelector";

interface ModelsTabProps {
  keyPool: ApiKeyPoolEntry[];
  onRefresh: () => void;
  t: any;
  isAr: boolean;
}

// Visual theme metadata for each provider
const PROVIDER_METADATA: Record<
  string,
  {
    name: string;
    tagline: string;
    taglineAr: string;
    color: string;
    badgeColor: string;
    borderAccent: string;
    bgGlow: string;
    icon: string;
    recommendedFor: string;
    recommendedForAr: string;
    isPrimary: boolean;
  }
> = {
  google: {
    name: "Google Gemini",
    tagline: "Ultra-fast multimodal with massive 1M+ context window",
    taglineAr: "سرعة فائقة ونافذة سياق ضخمة تتجاوز مليون توكن",
    color: "text-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    borderAccent: "hover:border-blue-500/50",
    bgGlow: "from-blue-500/5 to-transparent",
    icon: "💎",
    recommendedFor: "Fast multilingual concierge & live RAG catalog lookup",
    recommendedForAr: "الكونسيرج السياحي فائق السرعة واسترجاع بيانات الكتالوج",
    isPrimary: true,
  },
  openai: {
    name: "OpenAI",
    tagline: "Industry-leading reasoning and nuanced conversations",
    taglineAr: "أعلى دقة في الاستنتاج والصياغة السياحية الفاخرة",
    color: "text-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    borderAccent: "hover:border-emerald-500/50",
    bgGlow: "from-emerald-500/5 to-transparent",
    icon: "🟢",
    recommendedFor: "Primary GuideR conversational quality & itinerary synthesis",
    recommendedForAr: "المحادثة الرئيسية لـ GuideR وتنسيق البرامج السياحية المعقدة",
    isPrimary: true,
  },
  openrouter: {
    name: "OpenRouter",
    tagline: "Aggregator of 200+ models with smart zero-delay fallback",
    taglineAr: "بوابة موحدة لأكثر من 200 موديل مع تدوير ذكي بدون توقف",
    color: "text-purple-500",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    borderAccent: "hover:border-purple-500/50",
    bgGlow: "from-purple-500/5 to-transparent",
    icon: "🔀",
    recommendedFor: "Zero-latency fallback & multilingual cost optimization",
    recommendedForAr: "خط الدفاع الاحتياطي وتقليل تكلفة التوكنز للغات متعددة",
    isPrimary: true,
  },
  xai: {
    name: "xAI / Grok",
    tagline: "High-speed Grok models for real-time travel answers",
    taglineAr: "موديلات غروك فائقة السرعة للاستجابة المباشرة",
    color: "text-zinc-400",
    badgeColor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
    borderAccent: "hover:border-zinc-500/50",
    bgGlow: "from-zinc-500/5 to-transparent",
    icon: "⚡",
    recommendedFor: "Alternative conversational engine & cost benchmark",
    recommendedForAr: "محرك محادثة بديل ومقارنة الأداء والتكلفة",
    isPrimary: false,
  },
  deepseek: {
    name: "DeepSeek Direct",
    tagline: "Direct low-cost API with exceptional reasoning",
    taglineAr: "واجهة ديب سيك المباشرة بأقل تكلفة مع ذكاء منطقي متقدم",
    color: "text-cyan-500",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    borderAccent: "hover:border-cyan-500/50",
    bgGlow: "from-cyan-500/5 to-transparent",
    icon: "🐳",
    recommendedFor: "Direct DeepSeek V3 chat & reasoning with minimal spend",
    recommendedForAr: "الاستدعاء المباشر لديب سيك V3 بأقل ميزانية ممكنة",
    isPrimary: false,
  },
  custom: {
    name: "Custom OpenAI-Compatible",
    tagline: "Any private proxy, local vLLM, Ollama, or custom gateway",
    taglineAr: "أي بوابة مخصصة تدعم بروتوكول OpenAI أو خادم محلي",
    color: "text-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    borderAccent: "hover:border-amber-500/50",
    bgGlow: "from-amber-500/5 to-transparent",
    icon: "⚙️",
    recommendedFor: "Self-hosted LLMs, enterprise reverse proxies & testing",
    recommendedForAr: "الاستضافة الذاتية وبوابات الحماية المخصصة والمحاكاة",
    isPrimary: false,
  },
  anthropic: {
    name: "Anthropic Claude (Legacy)",
    tagline: "Legacy Claude models preserved for existing deployments",
    taglineAr: "موديلات كلود الموروثة محفوظة للتهيئة السابقة",
    color: "text-orange-500",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    borderAccent: "hover:border-orange-500/50",
    bgGlow: "from-orange-500/5 to-transparent",
    icon: "🏛️",
    recommendedFor: "Legacy compatibility only (not recommended for new setup)",
    recommendedForAr: "للتوافق الموروث فقط (غير مفضل للإعدادات الجديدة)",
    isPrimary: false,
  },
};

export function ModelsTab({ keyPool, onRefresh, t, isAr }: ModelsTabProps) {
  // Navigation & Wizard State
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingAllProvider, setTestingAllProvider] = useState<string | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyPoolEntry | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Wizard Form State
  const [selectedProvider, setSelectedProvider] = useState("google");
  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showEditApiKey, setShowEditApiKey] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Testing & Discovery State in Wizard
  const [testingInWizard, setTestingInWizard] = useState(false);
  const [testResult, setTestResult] = useState<ProviderTestResult | null>(null);
  const [liveDiscoveredModels, setLiveDiscoveredModels] = useState<Record<string, DiscoveredModelItem[]>>({});
  const [isDiscoveringLiveModels, setIsDiscoveringLiveModels] = useState(false);
  const [liveDiscoveryError, setLiveDiscoveryError] = useState<string | null>(null);

  // Registry & Routing Data from Backend
  const [registryModels, setRegistryModels] = useState<ModelCapabilityItem[]>([]);
  const [providers, setProviders] = useState<ProviderRegistryItem[]>([]);
  const [routingData, setRoutingData] = useState<RoutingPolicyData | null>(null);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [modelSearch, setModelSearch] = useState("");
  const [modelProviderFilter, setModelProviderFilter] = useState("all");

  // Load authoritative data from backend on mount
  useEffect(() => {
    loadRegistryData();
  }, []);

  const loadRegistryData = async () => {
    setLoadingRegistry(true);
    try {
      const [modelsRes, routingRes] = await Promise.all([
        aiApi.getAllModels().catch(() => ({ models: [], providers: [] })),
        aiApi.getRoutingPolicy().catch(() => null),
      ]);
      setRegistryModels(modelsRes.models || []);
      setProviders(modelsRes.providers || []);
      if (routingRes) setRoutingData(routingRes);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load model registry.");
    } finally {
      setLoadingRegistry(false);
    }
  };

  // Discover Live Models from Provider
  const handleDiscoverLiveModels = async (provId: string, customKey?: string, customUrl?: string, credId?: string) => {
    const keyToUse = customKey !== undefined ? customKey.trim() : apiKey.trim();
    const urlToUse = customUrl !== undefined ? customUrl.trim() : customBaseUrl.trim();
    if (!keyToUse && !credId) {
      toast.error(
        isAr
          ? "يرجى إدخال مفتاح API أولاً لاكتشاف الموديلات الحية."
          : "Please enter an API key to discover live models."
      );
      return;
    }
    setIsDiscoveringLiveModels(true);
    setLiveDiscoveryError(null);
    try {
      const res = await aiApi.refreshProviderModels(provId, {
        apiKey: keyToUse || undefined,
        baseUrl: urlToUse || undefined,
        credentialId: credId,
        forceRefresh: true,
      });
      const models = res.models || [];
      setLiveDiscoveredModels((prev) => ({ ...prev, [provId]: models }));
      if (models.length > 0) {
        toast.success(
          isAr
            ? `🎉 تم اكتشاف ${models.length} موديل نشط مباشرة من ${PROVIDER_METADATA[provId]?.name || provId}!`
            : `🎉 Discovered ${models.length} active models directly from ${PROVIDER_METADATA[provId]?.name || provId}!`
        );
        const available = models.filter((m) => m.status === "AVAILABLE");
        if (available.length > 0 && !available.some((m) => m.id === selectedModel)) {
          setSelectedModel(available[0].id);
        }
      } else {
        toast.warning(isAr ? "لم يتم العثور على موديلات متوافقة." : "No compatible models found.");
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to discover live models from provider.";
      setLiveDiscoveryError(msg);
      toast.error(msg);
    } finally {
      setIsDiscoveringLiveModels(false);
    }
  };

  // Models available for the currently selected provider in the wizard
  const availableModelsForProvider = useMemo(() => {
    if (!Array.isArray(registryModels)) return [];
    const prov = (selectedProvider || "").toLowerCase();
    if (prov === "custom") {
      return registryModels.filter((m) => (m?.provider || "").toLowerCase() === "custom");
    }
    return registryModels.filter((m) => (m?.provider || "").toLowerCase() === prov);
  }, [registryModels, selectedProvider]);

  // Provider definition lookup
  const currentProviderDef = useMemo(() => {
    return (
      providers.find((p) => p.id === selectedProvider) || {
        id: selectedProvider,
        name: PROVIDER_METADATA[selectedProvider]?.name || selectedProvider,
        defaultBaseUrl: "",
        defaultModel: "",
        models: [],
        apiKeyUrl: "https://aistudio.google.com/apikey",
        setupInstructions: [],
        allowCustomBaseUrl: selectedProvider === "custom",
      }
    );
  }, [providers, selectedProvider]);

  // Step 1 -> Step 2 transition
  const handleSelectProviderCard = (providerId: string) => {
    setSelectedProvider(providerId);
    const providerModels = registryModels.filter(
      (m) => m.provider.toLowerCase() === providerId.toLowerCase()
    );
    const defaultModel =
      providerModels.find((m) => m.isDefault)?.id ||
      providerModels[0]?.id ||
      (providerId === "google" ? "gemini-3.7-flash" : providerId === "openai" ? "gpt-4o-mini" : "");

    setSelectedModel(defaultModel);
    setLabel(
      isAr
        ? `مفتاح ${PROVIDER_METADATA[providerId]?.name || providerId}`
        : `${PROVIDER_METADATA[providerId]?.name || providerId} Credential`
    );
    setApiKey("");
    setCustomBaseUrl("");
    setTestResult(null);
    setLiveDiscoveryError(null);
    setWizardStep(2);
    setShowAddWizard(true);
  };

  // Open the wizard
  const handleOpenAddWizard = () => {
    setSelectedProvider("google");
    setSelectedModel("gemini-3.7-flash");
    setApiKey("");
    setCustomBaseUrl("");
    setLabel("Google Gemini Production Key");
    setPriority(keyPool.length + 1);
    setIsActive(true);
    setTestResult(null);
    setLiveDiscoveryError(null);
    setWizardStep(1);
    setShowAddWizard(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (k: ApiKeyPoolEntry) => {
    setEditingKey(k);
    setSelectedProvider(k.provider);
    setSelectedModel(k.model);
    setApiKey("");
    setCustomBaseUrl(k.baseUrl || "");
    setLabel(k.label || "");
    setPriority(k.priority);
    setIsActive(k.isActive);
    setTestResult(null);
    setLiveDiscoveryError(null);
    setShowEditModal(true);
    if (k.hasKey) {
      handleDiscoverLiveModels(k.provider, undefined, k.baseUrl, k.id);
    }
  };

  // Live Connection Test in Wizard
  const handleTestInWizard = async () => {
    if (!apiKey.trim()) {
      toast.error(
        isAr ? "يرجى إدخال مفتاح API أولاً لإجراء الاختبار." : "Please enter an API key first to test."
      );
      return;
    }

    setTestingInWizard(true);
    setTestResult(null);

    try {
      const res = await aiApi.testConnection({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey.trim(),
      });
      setTestResult(res);

      if (res.success) {
        toast.success(
          isAr
            ? `✅ تم التحقق من الاتصال بنجاح! (${res.latencyMs}ms)`
            : `✅ Connection verified successfully! (${res.latencyMs}ms latency)`
        );
      } else {
        toast.error(res.diagnosis || res.error || "Connection test failed.");
      }
    } catch (err: any) {
      const fallbackResult: ProviderTestResult = {
        success: false,
        code: "UNKNOWN_ERROR",
        provider: selectedProvider,
        model: selectedModel,
        error: err?.message || "Failed to execute connection test.",
        diagnosis: err?.message,
      };
      setTestResult(fallbackResult);
      toast.error(err?.message || "Test failed.");
    } finally {
      setTestingInWizard(false);
    }
  };

  // Save Credential from Wizard
  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error(isAr ? "مفتاح API مطلوب." : "API Key secret is required.");
      return;
    }

    if (!selectedModel.trim()) {
      toast.error(isAr ? "يرجى اختيار الموديل." : "Please select a model.");
      return;
    }

    setSaving(true);
    try {
      await aiApi.addPoolKey({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey.trim(),
        baseUrl: selectedProvider === "custom" ? customBaseUrl.trim() || undefined : undefined,
        label: label.trim() || `${selectedProvider} - ${selectedModel}`,
        priority: Number(priority),
        isActive,
      });

      toast.success(
        isAr
          ? "🎉 تمت إضافة المزود بنجاح إلى منظومة الذكاء الاصطناعي!"
          : "🎉 Provider credential added successfully!"
      );
      setShowAddWizard(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save credential.");
    } finally {
      setSaving(false);
    }
  };

  // Save Edited Credential
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    setSaving(true);
    try {
      await aiApi.updatePoolKey(editingKey.id, {
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey.trim() || undefined,
        baseUrl: selectedProvider === "custom" ? customBaseUrl.trim() || undefined : undefined,
        label: label.trim() || undefined,
        priority: Number(priority),
        isActive,
      });

      toast.success(isAr ? "تم تحديث البيانات بنجاح!" : "Credential updated successfully!");
      setShowEditModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update credential.");
    } finally {
      setSaving(false);
    }
  };

  // Test single credential in the table
  const handleTestKeyInTable = async (id: string) => {
    setTestingId(id);
    try {
      const res = await aiApi.testPoolKey(id);
      if (res.success) {
        toast.success(
          isAr
            ? `✅ الاتصال سليم (${res.latencyMs}ms) — الموديل: ${res.model}`
            : `✅ Healthy connection (${res.latencyMs}ms) — Model: ${res.model}`
        );
      } else {
        toast.error(
          `[${res.code}] ${res.diagnosis || res.error || "Connection test failed."}`
        );
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Test failed.");
    } finally {
      setTestingId(null);
    }
  };

  // Delete credential
  const handleDeleteKey = async (id: string) => {
    if (
      !confirm(
        isAr
          ? "هل أنت متأكد من حذف هذا المفتاح؟ سيتم استبعاده فوراً من التدوير."
          : "Are you sure you want to remove this credential? It will be removed from failover immediately."
      )
    )
      return;
    try {
      await aiApi.deletePoolKey(id);
      toast.success(isAr ? "تم حذف المفتاح بنجاح." : "Credential removed.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete key.");
    }
  };

  // Filter models for registry table
  const filteredModels = useMemo(() => {
    if (!Array.isArray(registryModels)) return [];
    const search = (modelSearch || "").toLowerCase();
    const filter = (modelProviderFilter || "all").toLowerCase();
    return registryModels.filter((m) => {
      const matchesSearch =
        (m?.name || "").toLowerCase().includes(search) ||
        (m?.id || "").toLowerCase().includes(search) ||
        (m?.nameAr && m.nameAr.includes(modelSearch));
      const matchesProvider =
        filter === "all" || (m?.provider || "").toLowerCase() === filter;
      return matchesSearch && matchesProvider;
    });
  }, [registryModels, modelSearch, modelProviderFilter]);

  // Provider health roll-up statistics
  const providerStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalKeys: number;
        healthyKeys: number;
        failedKeys: number;
        rateLimitedKeys: number;
        avgLatencyMs: number;
        lastTestedAt?: string;
        configuredModels: string[];
      }
    > = {};

    const safeKeyPool = Array.isArray(keyPool) ? keyPool : [];

    Object.keys(PROVIDER_METADATA).forEach((pId) => {
      const pKeys = safeKeyPool.filter((k) => (k?.provider || "").toLowerCase() === pId.toLowerCase());
      const healthy = pKeys.filter((k) => k?.lastStatus === "HEALTHY");
      const failed = pKeys.filter(
        (k) =>
          k?.lastStatus === "FAILED" ||
          k?.lastStatus === "INVALID_CREDENTIAL" ||
          k?.lastStatus === "CONFIGURATION_ERROR"
      );
      const rateLimited = pKeys.filter((k) => k?.lastStatus === "RATE_LIMITED");
      const latencies = healthy.map((k) => k?.lastLatencyMs || 0).filter((l) => l > 0);
      const avgLat = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
      const models = Array.from(new Set(pKeys.map((k) => k?.model).filter(Boolean)));

      stats[pId] = {
        totalKeys: pKeys.length,
        healthyKeys: healthy.length,
        failedKeys: failed.length,
        rateLimitedKeys: rateLimited.length,
        avgLatencyMs: avgLat,
        configuredModels: models,
      };
    });

    return stats;
  }, [keyPool]);

  return (
    <div className="space-y-8">
      {/* ── SECTION 1: HEADER & PRIMARY ACTION ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {isAr ? "إدارة مزودي الذكاء الاصطناعي والموديلات" : "AI Providers & Model Routing"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "إدارة مفاتيح API الآمنة، مصفوفة التدوير الذاتي، وتوجيه حركة المحادثات السياحية (V3)"
                  : "Authoritative provider registry, zero-latency failover, and multi-tier model routing (V3)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <Button
            onClick={handleOpenAddWizard}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {isAr ? "إضافة مزود / مفتاح جديد" : "Add AI Provider"}
          </Button>
        </div>
      </div>

      {/* ── SECTION 2: SYSTEM ROUTING POLICY PANEL ─────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            {isAr ? "سياسة توجيه الموديلات لـ GuideR (Routing Policy V3)" : "GuideR Model Routing Policy (Tiered)"}
          </h3>
          <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
            Deterministic Classifier
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Economy Tier */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                🟢 {isAr ? "المستوى الاقتصادي (Economy)" : "Economy / FAQ"}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-600">
                $0.25 / 1M
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {routingData?.table?.economy?.model || "gemini-3.1-flash-lite"}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isAr ? "للأسئلة الشائعة والتحية واستفسارات السياسات البسيطة" : "FAQ, policies, basic catalog queries & greetings"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              <span>Google Gemini</span>
              <span className="text-emerald-500 font-bold">~120ms</span>
            </div>
          </div>

          {/* Normal Tier */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                🔵 {isAr ? "المحادثة القياسية (Normal)" : "Standard Concierge"}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-600">
                Flagship
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {routingData?.table?.normal?.model || "gemini-3.7-flash"}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isAr ? "محادثات الكونسيرج الفاخر وتخصيص الباقات السياحية" : "High-touch luxury travel dialogue & recommendation"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              <span>Google / OpenAI</span>
              <span className="text-blue-500 font-bold">Primary</span>
            </div>
          </div>

          {/* Complex Tier */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                🟣 {isAr ? "البرامج المعقدة (Complex)" : "Complex Itinerary"}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono border-purple-500/30 text-purple-600">
                Advanced
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {routingData?.table?.complex?.model || "gemini-3.1-pro"}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isAr ? "بناء الجداول متعددة المدن وتنسيق الرحلات وحساب الميزانيات" : "Multi-city itinerary synthesis & constraint solving"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              <span>Google Gemini</span>
              <span className="text-purple-500 font-bold">2M Context</span>
            </div>
          </div>

          {/* Fallback Tier */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                🟡 {isAr ? "الاحتياطي الدائم (Fallback)" : "Fallback Routing"}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-600">
                Zero Down
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {routingData?.table?.fallback?.model || "deepseek/deepseek-chat-v3-0324"}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isAr ? "تدوير تلقائي عند انقطاع أي مزود لضمان استمرارية الخدمة" : "Instant failover if primary provider is degraded"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              <span>OpenRouter / DeepSeek</span>
              <span className="text-amber-500 font-bold">Auto</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PROVIDER CARDS OVERVIEW ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-500" />
            {isAr ? "المزودون المعتمدون وحالة الاتصال" : "Official AI Providers & Health Status"}
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            {isAr
              ? `${keyPool.filter((k) => k.isActive).length} مفتاح نشط مسجل`
              : `${keyPool.filter((k) => k.isActive).length} active credentials`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PROVIDER_METADATA)
            .filter(([pId]) => pId !== "anthropic" || keyPool.some((k) => k.provider === "anthropic"))
            .map(([pId, meta]) => {
              const stat = providerStats[pId] || { totalKeys: 0, healthyKeys: 0, failedKeys: 0, rateLimitedKeys: 0, avgLatencyMs: 0, configuredModels: [] };
              const isConfigured = stat.totalKeys > 0;
              const isHealthy = stat.healthyKeys > 0 && stat.failedKeys === 0;
              const hasFailure = stat.failedKeys > 0;

              return (
                <div
                  key={pId}
                  className={`rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md ${meta.borderAccent}`}
                >
                  <div className="space-y-2.5">
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-foreground">{meta.name}</h4>
                            {meta.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {isAr ? meta.taglineAr : meta.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Health Status Badge */}
                      {isConfigured ? (
                        isHealthy ? (
                          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                            ● Healthy
                          </Badge>
                        ) : hasFailure ? (
                          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] shrink-0">
                            ● Issues ({stat.failedKeys})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] shrink-0">
                            ● Untested
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground text-[10px] shrink-0">
                          Not Setup
                        </Badge>
                      )}
                    </div>

                    {/* Metadata & Stats */}
                    <div className="rounded-xl bg-muted/30 p-2.5 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{isAr ? "المفاتيح المسجلة:" : "Credentials:"}</span>
                        <span className="font-bold text-foreground font-mono">
                          {stat.totalKeys} {stat.totalKeys === 1 ? "key" : "keys"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{isAr ? "زمن الاستجابة:" : "Latency:"}</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {stat.avgLatencyMs > 0 ? `${stat.avgLatencyMs}ms` : "—"}
                        </span>
                      </div>

                      {stat.configuredModels.length > 0 && (
                        <div className="pt-1 border-t border-border/40">
                          <span className="text-[10px] text-muted-foreground block mb-1">
                            {isAr ? "الموديلات المرتبطة:" : "Configured Models:"}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {stat.configuredModels.map((m) => (
                              <span
                                key={m}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-background border border-border/60 text-foreground"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectProviderCard(pId)}
                      className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 p-0 px-2 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isAr ? "إضافة مفتاح" : "Add Key"}
                    </Button>

                    <a
                      href={
                        pId === "google"
                          ? "https://aistudio.google.com/apikey"
                          : pId === "openai"
                          ? "https://platform.openai.com/api-keys"
                          : pId === "openrouter"
                          ? "https://openrouter.ai/keys"
                          : pId === "xai"
                          ? "https://console.x.ai/"
                          : pId === "deepseek"
                          ? "https://platform.deepseek.com/api_keys"
                          : "https://ai.google.dev"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>{isAr ? "لوحة المزود" : "Get API Key"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── SECTION 4: CONFIGURED CREDENTIALS TABLE ─────────────────────── */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-500" />
                {isAr ? "مصفوفة المفاتيح والتدوير الذاتي (Credential Pool)" : "Configured AI Credentials & Failover Pool"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "يتم تدوير الطلبات بالترتيب حسب الأولوية. في حال حدوث خطأ 429 أو انقطاع يتم الانتقال فوراً للمفتاح التالي."
                  : "Requests execute sequentially by priority rank with instant zero-delay failover on rate limits or errors."}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] self-start sm:self-auto">
              Write-Only Key Security
            </Badge>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{isAr ? "الأولوية" : "Priority"}</th>
                <th className="px-4 py-3">{isAr ? "المزود" : "Provider"}</th>
                <th className="px-4 py-3">{isAr ? "الموديل المعين" : "Assigned Model"}</th>
                <th className="px-4 py-3">{isAr ? "المفتاح المشفر" : "Masked Secret Key"}</th>
                <th className="px-4 py-3">{isAr ? "الحالة" : "Health Status"}</th>
                <th className="px-4 py-3">{isAr ? "الاستجابة" : "Latency"}</th>
                <th className="px-4 py-3 text-right">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {keyPool.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center text-2xl">
                      🔑
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {isAr ? "لم تتم إضافة أي مزود ذكاء اصطناعي بعد." : "No AI Provider Credentials configured yet."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                        {isAr
                          ? "انقر على 'إضافة مزود' للبدء في ربط Google Gemini أو OpenAI أو OpenRouter."
                          : "Click 'Add AI Provider' above to connect Google Gemini, OpenAI, or OpenRouter."}
                      </p>
                    </div>
                    <Button
                      onClick={handleOpenAddWizard}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isAr ? "إضافة أول مفتاح الآن" : "Add First Provider"}
                    </Button>
                  </td>
                </tr>
              ) : (
                (keyPool || [])
                  .slice()
                  .sort((a, b) => (a?.priority ?? 99) - (b?.priority ?? 99))
                  .map((entry) => {
                    const isHealthy = entry.lastStatus === "HEALTHY";
                    const isRateLimited = entry.lastStatus === "RATE_LIMITED";
                    const isInvalidCred = entry.lastStatus === "INVALID_CREDENTIAL";
                    const isConfigError = entry.lastStatus === "CONFIGURATION_ERROR";
                    const isFailed = entry.lastStatus === "FAILED";

                    return (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        {/* Priority Rank */}
                        <td className="px-4 py-3 font-mono font-bold text-amber-500">
                          #{entry.priority}
                        </td>

                        {/* Provider */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">
                              {PROVIDER_METADATA[entry.provider]?.icon || "⚙️"}
                            </span>
                            <span className="font-bold text-foreground capitalize">
                              {PROVIDER_METADATA[entry.provider]?.name || entry.provider}
                            </span>
                          </div>
                          {entry.label && (
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              {entry.label}
                            </span>
                          )}
                        </td>

                        {/* Model */}
                        <td className="px-4 py-3 font-mono text-foreground font-semibold">
                          <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/60 text-[11px]">
                            {entry.model}
                          </span>
                        </td>

                        {/* Masked Key */}
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {entry.maskedKey || "••••••••••••••••"}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          {isHealthy ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]"
                            >
                              Healthy
                            </Badge>
                          ) : isRateLimited ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]"
                            >
                              429 Rate Limit
                            </Badge>
                          ) : isInvalidCred ? (
                            <Badge
                              variant="outline"
                              className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]"
                            >
                              Invalid Key
                            </Badge>
                          ) : isConfigError ? (
                            <Badge
                              variant="outline"
                              className="border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px]"
                            >
                              Config Error
                            </Badge>
                          ) : isFailed ? (
                            <Badge
                              variant="outline"
                              className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]"
                            >
                              Failed ({entry.failCount})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-muted text-muted-foreground text-[10px]">
                              Untested
                            </Badge>
                          )}
                        </td>

                        {/* Latency */}
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {entry.lastLatencyMs ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {entry.lastLatencyMs}ms
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestKeyInTable(entry.id)}
                              disabled={testingId === entry.id}
                              className="h-7 px-2 text-[11px] font-bold border-border/80 hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  testingId === entry.id ? "animate-spin text-emerald-500" : ""
                                }`}
                              />
                              {testingId === entry.id ? t("models.testing") : isAr ? "اختبار" : "Test"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(entry)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(entry.id)}
                              className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── SECTION 5: AUTHORITATIVE MODEL REGISTRY & TOKEN PRICING TABLE ── */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-500" />
                {isAr ? "سجل الموديلات المعتمدة وأسعار التوكنز (Model Registry)" : "Authoritative Model Registry & FinOps Specs"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "الموديلات المعتمدة رسمياً في المنظومة، نوافذ السياق، والأسعار لكل مليون توكن."
                  : "Centrally verified models, context windows, and real-time token pricing per 1M tokens."}
              </CardDescription>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder={isAr ? "بحث بالاسم أو المعرف..." : "Search models..."}
                  className="h-8 text-xs font-medium ps-8 w-44 bg-background"
                />
              </div>

              <select
                value={modelProviderFilter}
                onChange={(e) => setModelProviderFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground"
              >
                <option value="all">{isAr ? "كل المزودين" : "All Providers"}</option>
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="xai">xAI / Grok</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{isAr ? "الموديل والمعرف" : "Model Name & API ID"}</th>
                <th className="px-4 py-3">{isAr ? "المزود" : "Provider"}</th>
                <th className="px-4 py-3">{isAr ? "التصنيف" : "Tier"}</th>
                <th className="px-4 py-3">{isAr ? "نافذة السياق" : "Context Window"}</th>
                <th className="px-4 py-3">{isAr ? "الإدخال / 1M" : "Input / 1M"}</th>
                <th className="px-4 py-3">{isAr ? "الإخراج / 1M" : "Output / 1M"}</th>
                <th className="px-4 py-3">{isAr ? "الميزات" : "Capabilities"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredModels.map((m) => {
                const isEconomy = m.recommendation === "economy";
                const isBalanced = m.recommendation === "balanced";
                const isPremium = m.recommendation === "premium";
                const isFallback = m.recommendation === "fallback";

                return (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    {/* Model Name & ID */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-foreground block">
                        {isAr && m.nameAr ? m.nameAr : m.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {m.id}
                      </span>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3 font-semibold uppercase text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>{PROVIDER_METADATA[m.provider]?.icon || "⚙️"}</span>
                        <span>{m.provider}</span>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="px-4 py-3">
                      {isEconomy ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Economy
                        </span>
                      ) : isBalanced ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                          Balanced
                        </span>
                      ) : isPremium ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          Advanced
                        </span>
                      ) : isFallback ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Fallback
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                          {m.badge || "Standard"}
                        </span>
                      )}
                    </td>

                    {/* Context Window */}
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">
                      {(m.contextWindow / 1000).toLocaleString()}k tokens
                    </td>

                    {/* Input Price */}
                    <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ${m.inputCostPer1M.toFixed(2)}
                    </td>

                    {/* Output Price */}
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-bold">
                      ${m.outputCostPer1M.toFixed(2)}
                    </td>

                    {/* Features */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.supportsToolCalling && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Tools
                          </span>
                        )}
                        {m.supportsVision && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Vision
                          </span>
                        )}
                        {m.supportsStructuredOutput && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            JSON
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── SECTION 6: TWO-STEP ADD PROVIDER WIZARD MODAL ─────────────────── */}
      {showAddWizard && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden space-y-0">
            {/* Wizard Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {wizardStep === 1 ? "1" : "2"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {wizardStep === 1
                      ? isAr
                        ? "الخطوة 1: اختر مزود الخدمة"
                        : "Step 1: Choose AI Provider"
                      : isAr
                      ? `الخطوة 2: تهيئة ${PROVIDER_METADATA[selectedProvider]?.name || selectedProvider}`
                      : `Step 2: Configure ${PROVIDER_METADATA[selectedProvider]?.name || selectedProvider}`}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {wizardStep === 1
                      ? isAr
                        ? "اختر المزود المراد ربطه بالمنظومة"
                        : "Select the AI infrastructure provider to connect"
                      : isAr
                      ? "أدخل المفتاح السري، اختبر الاتصال، واختر الموديل المتوافق"
                      : "Enter secret key, test connectivity, and select verified models"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddWizard(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: CHOOSE PROVIDER CARDS */}
            {wizardStep === 1 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(PROVIDER_METADATA)
                    .filter(([pId]) => pId !== "anthropic")
                    .map(([pId, meta]) => (
                      <button
                        key={pId}
                        type="button"
                        onClick={() => handleSelectProviderCard(pId)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-2 group hover:border-emerald-500 hover:shadow-sm ${
                          selectedProvider === pId
                            ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                            : "border-border/80 bg-card hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{meta.icon}</span>
                            <div>
                              <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {meta.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {isAr ? meta.taglineAr : meta.tagline}
                              </p>
                            </div>
                          </div>
                          {meta.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                              Top
                            </span>
                          )}
                        </div>

                        <div className="pt-1 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="line-clamp-1">
                            {isAr ? meta.recommendedForAr : meta.recommendedFor}
                          </span>
                          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* STEP 2: API KEY & MODEL SELECTION */}
            {wizardStep === 2 && (
              <form onSubmit={handleSaveCredential} className="p-5 space-y-4 text-xs">
                {/* Provider Instructions Alert Box */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-xs flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" />
                      {isAr
                        ? `كيفية الحصول على مفتاح ${PROVIDER_METADATA[selectedProvider]?.name || selectedProvider}`
                        : `How to get your ${PROVIDER_METADATA[selectedProvider]?.name || selectedProvider} API Key`}
                    </span>
                    {currentProviderDef.apiKeyUrl && (
                      <a
                        href={currentProviderDef.apiKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isAr ? "افتح لوحة المفاتيح" : "Open Key Console"}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>

                  {currentProviderDef.setupInstructions && currentProviderDef.setupInstructions.length > 0 && (
                    <ol className="text-[11px] text-muted-foreground list-decimal list-inside space-y-0.5">
                      {currentProviderDef.setupInstructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3 text-emerald-500" />
                      {isAr ? "مفتاح API السري" : "API Key Secret"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer select-none transition-colors"
                    >
                      {showApiKey ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>{isAr ? "إخفاء المفتاح" : "Hide Key"}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isAr ? "إظهار المفتاح" : "Show Key"}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setTestResult(null);
                        }}
                        onBlur={() => {
                          if (apiKey.trim().length >= 8 && !liveDiscoveredModels[selectedProvider]?.length) {
                            void handleDiscoverLiveModels(selectedProvider, apiKey, customBaseUrl);
                          }
                        }}
                        placeholder={
                          selectedProvider === "google"
                            ? "AIzaSy..."
                            : selectedProvider === "openai"
                            ? "sk-proj-..."
                            : selectedProvider === "openrouter"
                            ? "sk-or-..."
                            : selectedProvider === "deepseek"
                            ? "sk-..."
                            : "Paste API Key..."
                        }
                        className="font-mono text-xs h-9 bg-background pe-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 transition-colors"
                        title={showApiKey ? (isAr ? "إخفاء المفتاح" : "Hide Key") : isAr ? "إظهار المفتاح" : "Show Key"}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestInWizard}
                      disabled={testingInWizard || !apiKey.trim()}
                      className="h-9 px-3 text-xs font-bold shrink-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-3 w-3 me-1 ${testingInWizard ? "animate-spin text-emerald-500" : ""}`}
                      />
                      {testingInWizard ? (isAr ? "جاري الاختبار..." : "Testing...") : isAr ? "اختبار الاتصال" : "Test Connection"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr
                      ? "🔒 يتم تشفير المفتاح في قاعدة البيانات ولا يتم إرجاعه للواجهة نهائياً بعد الحفظ."
                      : "🔒 Stored encrypted server-side with AES-256-GCM. Never returned to frontend in plaintext."}
                  </p>
                </div>

                {/* Test Result Banner */}
                {testResult && (
                  <div
                    className={`rounded-xl p-3 text-xs flex items-start gap-2.5 border ${
                      testResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className="font-bold">
                        {testResult.success
                          ? isAr
                            ? `الاتصال ناجح! استجابة سريعة في ${testResult.latencyMs}ms`
                            : `Connection Verified! Latency: ${testResult.latencyMs}ms`
                          : `[${testResult.code}] ${testResult.error || "Connection Failed"}`}
                      </p>
                      {testResult.diagnosis && (
                        <p className="text-[11px] opacity-90">{testResult.diagnosis}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Discover Models Button & Live Status */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      {isAr ? "اكتشاف الموديلات الحية من المزود" : "Live Provider Model Discovery"}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {liveDiscoveredModels[selectedProvider]?.length
                        ? isAr
                          ? `✅ تم اكتشاف ${liveDiscoveredModels[selectedProvider].length} موديل متاح لهذا المفتاح`
                          : `✅ ${liveDiscoveredModels[selectedProvider].length} active models discovered for this key`
                        : isAr
                        ? "استعلم مباشرة من مزود الذكاء الاصطناعي لجلب الموديلات المفعلة لمفتاحك فقط"
                        : "Query the official provider API to fetch models available for your specific key"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDiscoverLiveModels(selectedProvider, apiKey, customBaseUrl)}
                    disabled={isDiscoveringLiveModels || !apiKey.trim()}
                    className="h-8 text-xs font-bold gap-1 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isDiscoveringLiveModels ? "animate-spin" : ""}`} />
                    {isDiscoveringLiveModels ? (isAr ? "جاري الاكتشاف..." : "Discovering...") : isAr ? "اكتشاف الموديلات" : "Discover Models"}
                  </Button>
                </div>

                {/* Model Selector */}
                <ModelSelector
                  provider={selectedProvider}
                  value={selectedModel}
                  onChange={(m) => setSelectedModel(m)}
                  discoveredModels={liveDiscoveredModels[selectedProvider]}
                  isLoadingModels={isDiscoveringLiveModels}
                  onRefreshModels={() => handleDiscoverLiveModels(selectedProvider, apiKey, customBaseUrl)}
                  discoveryError={liveDiscoveryError}
                  isAr={isAr}
                />

                {/* Label & Priority */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      {isAr ? "تسمية المفتاح" : "Credential Label"}
                    </label>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. Production Gemini Key"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      {isAr ? "الأولوية في التدوير" : "Failover Priority"}
                    </label>
                    <Input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)}
                      className="font-mono font-bold h-9 text-xs"
                      min={1}
                    />
                  </div>
                </div>

                {/* Advanced Settings Accordion (Custom URL only for Custom provider) */}
                {selectedProvider === "custom" && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block">
                      {isAr ? "رابط نقطة النهاية المخصص (Custom Base URL)" : "Custom Endpoint Base URL"}
                    </label>
                    <Input
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1 or https://my-proxy.com/v1"
                      className="font-mono text-xs h-9 bg-background"
                      required
                    />
                  </div>
                )}

                {/* Official Base URL (Read-Only Informational) */}
                {selectedProvider !== "custom" && currentProviderDef.defaultBaseUrl && (
                  <div className="rounded-lg bg-muted/30 p-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                    <span>Endpoint:</span>
                    <span className="text-foreground">{currentProviderDef.defaultBaseUrl}</span>
                  </div>
                )}

                {/* Wizard Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setWizardStep(1)}
                    className="font-bold text-xs h-9 cursor-pointer"
                  >
                    {isAr ? "← الرجوع لاختيار المزود" : "← Back to Providers"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddWizard(false)}
                      className="font-bold text-xs h-9 cursor-pointer"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || !selectedModel}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                    >
                      {saving
                        ? isAr
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : isAr
                        ? "حفظ المفتاح وتفعيله"
                        : "Save & Activate"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 7: EDIT CREDENTIAL MODAL ─────────────────────────────── */}
      {showEditModal && editingKey && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-500" />
                {isAr ? "تعديل إعدادات المفتاح" : "Edit Credential Settings"}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "المزود (مغلق)" : "Provider (Locked)"}
                  </label>
                  <Input
                    value={PROVIDER_METADATA[selectedProvider]?.name || selectedProvider}
                    disabled
                    className="h-9 text-xs font-bold bg-muted"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "الأولوية" : "Priority"}
                  </label>
                  <Input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)}
                    className="font-mono font-bold h-9"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                  {isAr ? "تسمية المفتاح" : "Label"}
                </label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Production Gemini Key"
                  className="h-9"
                />
              </div>

              <ModelSelector
                provider={selectedProvider}
                value={selectedModel}
                onChange={(m) => setSelectedModel(m)}
                discoveredModels={liveDiscoveredModels[selectedProvider]}
                isLoadingModels={isDiscoveringLiveModels}
                onRefreshModels={() => handleDiscoverLiveModels(selectedProvider, apiKey, customBaseUrl, editingKey?.id)}
                discoveryError={liveDiscoveryError}
                isAr={isAr}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase text-[10px] text-muted-foreground">
                    {isAr ? "تحديث مفتاح API (اتركه فارغاً للإبقاء على القديم)" : "New API Key Secret"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditApiKey(!showEditApiKey)}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer select-none transition-colors"
                  >
                    {showEditApiKey ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>{isAr ? "إخفاء" : "Hide"}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>{isAr ? "إظهار" : "Show"}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showEditApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={isAr ? "اتركه فارغاً للاحتفاظ بالمفتاح المشفر الحالي" : "Leave blank to keep existing encrypted key"}
                    className="font-mono text-xs h-9 bg-background pe-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditApiKey(!showEditApiKey)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 transition-colors"
                    title={showEditApiKey ? (isAr ? "إخفاء" : "Hide") : isAr ? "إظهار" : "Show"}
                  >
                    {showEditApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {selectedProvider === "custom" && (
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "رابط نقطة النهاية المخصص" : "Custom Base URL"}
                  </label>
                  <Input
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="https://my-proxy.com/v1"
                    className="font-mono text-xs h-9"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !selectedModel}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التعديلات" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
