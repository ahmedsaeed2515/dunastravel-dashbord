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
  RefreshCw
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

type AiTabKey = 
  | "overview" 
  | "agents" 
  | "knowledge" 
  | "models" 
  | "prompts" 
  | "conversations" 
  | "testingLab" 
  | "finOps";

export default function AdminAiControlCenterPage() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const [activeTab, setActiveTab] = useState<AiTabKey>("overview");
  const [selectedAgentForLab, setSelectedAgentForLab] = useState("guider");

  // Telemetry & Global AI State
  const [metrics, setMetrics] = useState<AiOverviewMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AiAnalyticsData | null>(null);
  const [keyPool, setKeyPool] = useState<ApiKeyPoolEntry[]>([]);
  const [agents, setAgents] = useState<AgentItemData[]>([]);
  const [activeProvider, setActiveProvider] = useState("anthropic");
  const [activeModel, setActiveModel] = useState("claude-3-5-sonnet-20241022");
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
        setActiveProvider(configRes.provider || "anthropic");
        setActiveModel(configRes.model || "claude-3-5-sonnet-20241022");
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

  const navTabs: Array<{ key: AiTabKey; label: string; icon: React.ReactNode; badge?: string }> = [
    { key: "overview", label: t("tabs.overview"), icon: <Activity className="h-4 w-4" /> },
    { key: "agents", label: t("tabs.agents"), icon: <Crown className="h-4 w-4 text-amber-500" />, badge: `${agents.length || 5}` },
    { key: "knowledge", label: t("tabs.knowledge"), icon: <Database className="h-4 w-4 text-blue-500" /> },
    { key: "models", label: t("tabs.models"), icon: <Cpu className="h-4 w-4 text-emerald-500" />, badge: `${keyPool.length || 1}` },
    { key: "prompts", label: t("tabs.prompts"), icon: <FileCode2 className="h-4 w-4" /> },
    { key: "conversations", label: t("tabs.conversations"), icon: <MessageSquare className="h-4 w-4 text-purple-500" />, badge: metrics?.activeConversations ? `+${metrics.activeConversations}` : undefined },
    { key: "testingLab", label: t("tabs.testingLab"), icon: <Sparkles className="h-4 w-4 text-amber-500" /> },
    { key: "finOps", label: t("tabs.finOps"), icon: <DollarSign className="h-4 w-4 text-purple-500" /> },
  ];

  return (
    <div className="space-y-6 pb-12" dir={isAr ? "rtl" : "ltr"}>
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {t("title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/60">
            Dunas AI OS v2.0
          </span>
        </div>
      </div>

      {/* Subnavigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs font-bold scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? "bg-amber-500/30 text-amber-800 dark:text-amber-200" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View Rendering */}
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

        {activeTab === "models" && (
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

        {activeTab === "finOps" && (
          <FinOpsTab
            analytics={analytics}
            onRefresh={fetchGlobalAiData}
            t={t}
            isAr={isAr}
          />
        )}
      </div>
    </div>
  );
}
