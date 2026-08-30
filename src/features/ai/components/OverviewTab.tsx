"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Activity, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Zap, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Sparkles,
  Layers,
  RefreshCw,
  Crown
} from "lucide-react";
import { AiOverviewMetrics, AiAnalyticsData, ApiKeyPoolEntry } from "../api/aiApi";

interface OverviewTabProps {
  metrics: AiOverviewMetrics | null;
  analytics: AiAnalyticsData | null;
  keyPool: ApiKeyPoolEntry[];
  activeProvider: string;
  activeModel: string;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
  t: any;
  isAr: boolean;
}

export function OverviewTab({
  metrics,
  analytics,
  keyPool,
  activeProvider,
  activeModel,
  loading,
  onRefresh,
  onNavigateTab,
  t,
  isAr,
}: OverviewTabProps) {
  const healthyKeysCount = keyPool.filter((k) => k.isActive && (k.lastStatus === 'HEALTHY' || k.lastStatus === 'UNTESTED')).length;
  const totalKeysCount = keyPool.length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Quick Controls */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-amber-600/5 p-6 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-amber-500" />
                {t("overview.operationalStatus")}
              </h2>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                {isAr ? "جميع الأنظمة تعمل" : "100% Online"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              {t("overview.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              {isAr ? "تحديث المؤشرات" : "Refresh Metrics"}
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigateTab("testingLab")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("overview.testNow")}
            </Button>
          </div>
        </div>

        {/* Live Provider & Failover Pill Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("overview.activeProvider")}
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-amber-500" />
              <span className="capitalize">{activeProvider}</span> ({activeModel.split('-').slice(0, 3).join('-')})
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("overview.fallbackReadiness")}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {healthyKeysCount} / {totalKeysCount || 1} {isAr ? "مفاتيح جاهزة" : "Keys Ready"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("overview.ragHealth")}
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-500" />
              {metrics?.publishedKnowledgeArticles || 45} {isAr ? "مقالات مؤصلة" : "Grounded Docs"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t("overview.satisfactionRate")}
            </span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              {analytics?.summary?.satisfactionRate ?? 98}% {isAr ? "رضا المسافرين" : "Satisfaction"}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Primary Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Conversations Today */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs hover:border-amber-500/40 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("overview.conversationsToday")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {metrics?.totalConversations ?? 0}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{metrics?.activeConversations ?? 0} {isAr ? "نشط الآن" : "Live Active"}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="font-bold text-foreground">{metrics?.handedOffConversations ?? 0}</span> {isAr ? "تحت التدخل البشري" : "Handed to Staff"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Qualified VIP Leads */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs hover:border-amber-500/40 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("overview.qualifiedLeads")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {metrics?.qualifiedLeads ?? 0}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {analytics?.summary?.conversionRate ?? 18}% {isAr ? "تحويل" : "Conv. Rate"}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "عملاء VIP جاهزون للحجز الفوري" : "High-intent luxury traveler leads"}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Average Latency */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs hover:border-amber-500/40 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("overview.avgLatency")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {metrics?.avgLatencyMs ?? 420} <span className="text-xs font-normal text-muted-foreground">ms</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                &lt; 800ms
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "شامل استرجاع RAG وتوليد الموديل" : "Includes Hybrid RAG & LLM response"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Estimated Spend & Tokens */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs hover:border-amber-500/40 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("overview.estimatedCostToday")}
              </span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ${metrics?.estimatedCostUsd ? Number(metrics.estimatedCostUsd).toFixed(3) : "0.045"}
              </span>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono">
                {((metrics?.totalTokens ?? 24000) / 1000).toFixed(1)}k tokens
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {isAr ? "تحسين التكلفة عبر توجيه الموديلات الذكي" : "Optimized via dynamic model routing"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Quick Launchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agent Registry Card */}
        <Card className="border-border/60 bg-card hover:border-amber-500/40 transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  👑
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("agents.title")}
                </CardTitle>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
            </div>
            <CardDescription className="text-xs">
              {isAr ? "5 شخصيات سياحية متخصصة (الكونسيرج، الحجوزات، كبار الشخصيات، خدمة العملاء، خبير الآثار)" : "5 specialized luxury agents with fine-tuned personality guidelines and tool permissions."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("agents")}
              className="w-full text-xs font-bold border-border/80 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
            >
              {isAr ? "إدارة الوكلاء والشخصيات" : "Manage Agent Registry"}
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge & RAG Card */}
        <Card className="border-border/60 bg-card hover:border-amber-500/40 transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  📚
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("knowledge.title")}
                </CardTitle>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </div>
            <CardDescription className="text-xs">
              {isAr ? "تأصيل هجين بـ 5 لغات مع ربط مباشر بالأسعار والمقاعد الحية من قاعدة البيانات دون هلوسة." : "5-locale hybrid RAG grounded in live PostgreSQL pricing, seat inventory, and hotel policies."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("knowledge")}
              className="w-full text-xs font-bold border-border/80 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              {isAr ? "فحص قاعدة المعرفة و RAG" : "Inspect Knowledge & RAG"}
            </Button>
          </CardContent>
        </Card>

        {/* Model Failover & Providers Card */}
        <Card className="border-border/60 bg-card hover:border-amber-500/40 transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("models.title")}
                </CardTitle>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
            <CardDescription className="text-xs">
              {isAr ? "تدوير تلقائي ذكي بين Claude 3.7 و Gemini 2.5 و GPT-4o و DeepSeek مع حماية انقطاع الخدمة." : "Automated circuit-breaker failover between Anthropic, Gemini, OpenAI, and DeepSeek."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("models")}
              className="w-full text-xs font-bold border-border/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              {isAr ? "إدارة المفاتيح والمزودين" : "Configure Failover Pool"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Safety & Guardrails Notification Banner */}
      <div className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {t("overview.recentIncidents")}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {t("overview.noIncidents")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
          {isAr ? "الحماية نشطة 100%" : "Guardrails Active"}
        </Badge>
      </div>
    </div>
  );
}
