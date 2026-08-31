"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { 
  Bot, 
  Activity, 
  Cpu, 
  Database, 
  FileCode2, 
  MessageSquare, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Crown,
  RefreshCw,
  Sliders,
  Settings,
  Users,
  Compass,
  CheckCircle2,
  HelpCircle,
  Code2,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { 
  aiApi, 
  AiOverviewMetrics, 
  AiAnalyticsData, 
  ApiKeyPoolEntry, 
  AgentItemData 
} from "@/features/ai/api/aiApi";
import { OverviewTab } from "@/features/ai/components/OverviewTab";
import { AgentsTab } from "@/features/ai/components/AgentsTab";
import { KnowledgeTab } from "@/features/ai/components/KnowledgeTab";
import { ModelsTab } from "@/features/ai/components/ModelsTab";
import { PromptsTab } from "@/features/ai/components/PromptsTab";
import { ConversationsTab } from "@/features/ai/components/ConversationsTab";
import { TestingLabTab } from "@/features/ai/components/TestingLabTab";
import { FinOpsTab } from "@/features/ai/components/FinOpsTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AiTabKey = 
  | "overview" 
  | "agents" 
  | "knowledge" 
  | "conversations" 
  | "testingLab" 
  | "settings"
  | "prompts"
  | "finOps";

class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; isAr: boolean; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("AI Tab Rendering Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-4 my-6">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {this.props.isAr ? "حدث خطأ غير متوقع أثناء عرض هذا القسم" : "An unexpected error occurred in this tab"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {this.state.error?.message || (this.props.isAr ? "يرجى إعادة المحاولة أو تحديث الصفحة." : "Please retry or refresh the page.")}
            </p>
          </div>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {this.props.isAr ? "إعادة المحاولة" : "Retry Section"}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminAiControlCenterPage() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  // Navigation State
  const [activeTab, setActiveTab] = useState<AiTabKey>("overview");
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [selectedAgentForLab, setSelectedAgentForLab] = useState("guider");

  // Telemetry & Global AI State
  const [metrics, setMetrics] = useState<AiOverviewMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AiAnalyticsData | null>(null);
  const [keyPool, setKeyPool] = useState<ApiKeyPoolEntry[]>([]);
  const [agents, setAgents] = useState<AgentItemData[]>([]);
  const [activeProvider, setActiveProvider] = useState("google");
  const [activeModel, setActiveModel] = useState("gemini-3.6-flash");
  const [loading, setLoading] = useState(true);

  const fetchGlobalAiData = async () => {
    setLoading(true);
    try {
      const [overviewRes, analyticsRes, keyPoolRes, agentsRes, configRes] = await Promise.all([
        aiApi.getOverview().catch(() => ({ metrics: null })),
        aiApi.getDetailedAnalytics().catch(() => null),
        aiApi.getKeyPool().catch(() => []),
        aiApi.getAgents(locale).catch(() => []),
        aiApi.getConfig().catch(() => null),
      ]);

      if (overviewRes?.metrics) setMetrics(overviewRes.metrics);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (Array.isArray(keyPoolRes)) setKeyPool(keyPoolRes);
      if (Array.isArray(agentsRes)) setAgents(agentsRes);
      if (configRes) {
        setActiveProvider(configRes.provider || "google");
        setActiveModel(configRes.model || "gemini-3.6-flash");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load AI Control Center data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAiData();
  }, [locale]);

  const handleNavigateToLab = (agentSlug: string = "guider") => {
    setSelectedAgentForLab(agentSlug);
    setActiveTab("testingLab");
  };

  // Human-Friendly Navigation Structure (Simple Mode by Default)
  const navTabs: Array<{ key: AiTabKey; label: string; labelEn: string; icon: React.ReactNode; badge?: string }> = [
    { 
      key: "overview", 
      label: isAr ? "الرئيسية" : "Overview", 
      labelEn: "Overview",
      icon: <Activity className="h-4 w-4 text-amber-500" /> 
    },
    { 
      key: "agents", 
      label: isAr ? "فريق المساعدين" : "AI Assistants", 
      labelEn: "Assistants",
      icon: <Users className="h-4 w-4 text-emerald-500" />, 
      badge: `${(Array.isArray(agents) ? agents.length : 0) || 5}` 
    },
    { 
      key: "knowledge", 
      label: isAr ? "مصادر المعرفة" : "Knowledge", 
      labelEn: "Knowledge Sources",
      icon: <Database className="h-4 w-4 text-blue-500" /> 
    },
    { 
      key: "conversations", 
      label: isAr ? "محادثات العملاء" : "Conversations", 
      labelEn: "Traveler Chats",
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />, 
      badge: metrics?.activeConversations ? `+${metrics.activeConversations}` : undefined 
    },
    { 
      key: "testingLab", 
      label: isAr ? "جرب GuideR" : "Try GuideR", 
      labelEn: "Test Assistant",
      icon: <Sparkles className="h-4 w-4 text-amber-500" /> 
    },
    { 
      key: "settings", 
      label: isAr ? "المزودون والإعدادات" : "Providers & Settings", 
      labelEn: "Providers & Settings",
      icon: <Settings className="h-4 w-4 text-zinc-400" />, 
      badge: `${(Array.isArray(keyPool) ? keyPool.filter((k) => k?.isActive).length : 0) || 1}` 
    },
  ];

  // Additional tabs for Advanced Mode
  const advancedTabs: Array<{ key: AiTabKey; label: string; icon: React.ReactNode }> = [
    { key: "prompts", label: isAr ? "استوديو التعليمات المتقدم (Prompts)" : "Prompt Engineering Studio", icon: <FileCode2 className="h-4 w-4 text-indigo-400" /> },
    { key: "finOps", label: isAr ? "تحليل التكاليف والتوكنز (FinOps)" : "Token & Cost Attribution", icon: <DollarSign className="h-4 w-4 text-emerald-400" /> },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      {/* ── HEADER BAR ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isAr ? "مركز إدارة الذكاء الاصطناعي" : "AI Management Center"}
                </h1>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  ● {isAr ? "جاهز للخدمة" : "Online"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "إدارة GuideR والوكلاء الأذكياء ومصادر معلومات الرحلات من مكان واحد بسهولة."
                  : "Easily manage GuideR, smart travel assistants, and tour catalog knowledge in one place."}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Simple vs Advanced */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
              isAdvancedMode
                ? "bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300"
                : "bg-muted/50 border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={isAr ? "التبديل بين وضع المشرف البسيط ووضع المطور المتقدم" : "Toggle between Simple Admin and Advanced Technical mode"}
          >
            {isAdvancedMode ? (
              <>
                <Code2 className="h-3.5 w-3.5 text-purple-500" />
                <span>{isAr ? "الوضع المتقدم (Developer Mode)" : "Developer Mode"}</span>
              </>
            ) : (
              <>
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span>{isAr ? "الوضع البسيط (Simple Mode)" : "Simple Mode"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={fetchGlobalAiData}
            disabled={loading}
            className="h-8 px-2.5 rounded-xl border border-border/80 bg-background text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span className="hidden sm:inline">{isAr ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── HIGH-LEVEL NAVIGATION BAR ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs font-bold scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/40 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-semibold"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? "bg-amber-500/30 text-amber-900 dark:text-amber-100" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Advanced Tabs (Revealed only in Developer Mode) */}
        {isAdvancedMode &&
          advancedTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 border-dashed ${
                  isActive
                    ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/40 shadow-xs font-bold"
                    : "text-purple-600/70 dark:text-purple-400/70 hover:text-purple-600 hover:bg-purple-500/10 border-purple-500/20 font-semibold"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* ── ACTIVE TAB VIEW RENDERING ──────────────────────────────────── */}
      <TabErrorBoundary isAr={isAr} onReset={fetchGlobalAiData}>
        <div>
          {activeTab === "overview" && (
            <OverviewTab
              metrics={metrics}
              analytics={analytics}
              keyPool={keyPool}
              activeProvider={activeProvider}
              activeModel={activeModel}
              loading={loading}
              onRefresh={fetchGlobalAiData}
              onNavigateTab={(tab) => setActiveTab(tab as AiTabKey)}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "agents" && (
            <AgentsTab
              agents={agents}
              onRefresh={fetchGlobalAiData}
              onNavigateToLab={handleNavigateToLab}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "knowledge" && (
            <KnowledgeTab
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "conversations" && (
            <ConversationsTab
              onRefreshOverview={fetchGlobalAiData}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "testingLab" && (
            <TestingLabTab
              agents={agents}
              initialAgentSlug={selectedAgentForLab}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "settings" && (
            <ModelsTab
              keyPool={keyPool}
              onRefresh={fetchGlobalAiData}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "prompts" && (
            <PromptsTab
              onRefresh={fetchGlobalAiData}
              onNavigateToLab={handleNavigateToLab}
              t={t}
              isAr={isAr}
            />
          )}

          {activeTab === "finOps" && (
            <FinOpsTab
              analytics={analytics}
              onRefresh={fetchGlobalAiData}
              t={t}
              isAr={isAr}
            />
          )}
        </div>
      </TabErrorBoundary>
    </div>
  );
}
