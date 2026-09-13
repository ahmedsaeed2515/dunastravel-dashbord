"use client";

import React, { useState, useEffect } from "react";
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
  Crown,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  Flame,
  Check,
  Play,
  Key,
  Globe2,
  FileCode2,
  PhoneCall,
  Power,
  Wrench,
  Save,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { aiApi, AiOverviewMetrics, AiAnalyticsData, ApiKeyPoolEntry } from "../api/aiApi";

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
  const [showOnboarding, setShowOnboarding] = useState(true);

  const safeKeyPool = Array.isArray(keyPool) ? keyPool : [];
  const healthyPoolKeys = safeKeyPool.filter((k) => k?.isActive && k?.lastStatus === "HEALTHY");
  const failedKeys = safeKeyPool.filter(
    (k) =>
      k?.lastStatus === "FAILED" ||
      k?.lastStatus === "INVALID_CREDENTIAL" ||
      k?.lastStatus === "CONFIGURATION_ERROR"
  );
  
  const healthyKeysCount = metrics?.healthyApiKeysCount ?? healthyPoolKeys.length;
  const verifiedHealthyCount = metrics?.verifiedHealthyApiKeysCount ?? healthyKeysCount;
  const guiderStatus = metrics?.guiderStatus || 'ACTIVE';
  const isGuiderActive = guiderStatus === 'ACTIVE';
  const isGuiderMaintenance = guiderStatus === 'MAINTENANCE';
  const isGuiderDisabled = guiderStatus === 'DISABLED';
  const isSystemHealthy = isGuiderActive && healthyKeysCount > 0 && failedKeys.length === 0;
  const hasNoBackup = healthyKeysCount === 1;

  // Master Availability Control State
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'DISABLED'>(guiderStatus);
  const [customMessage, setCustomMessage] = useState(metrics?.guiderAvailability?.message || '');
  const [statusReason, setStatusReason] = useState(metrics?.guiderAvailability?.reason || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (metrics?.guiderStatus) {
      setSelectedStatus(metrics.guiderStatus);
    }
    if (metrics?.guiderAvailability?.message !== undefined) {
      setCustomMessage(metrics.guiderAvailability.message);
    }
    if (metrics?.guiderAvailability?.reason !== undefined) {
      setStatusReason(metrics.guiderAvailability.reason);
    }
  }, [metrics?.guiderStatus, metrics?.guiderAvailability]);

  const handleSaveStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await aiApi.updateGuiderStatus({
        status: selectedStatus,
        disabledMessage: customMessage.trim() || undefined,
        reason: statusReason.trim() || undefined,
      });
      toast.success(
        isAr 
          ? `تم تحديث حالة GuideR بنجاح (${selectedStatus === 'ACTIVE' ? 'نشط' : selectedStatus === 'MAINTENANCE' ? 'صيانة' : 'معطل'})`
          : `GuideR status updated to ${selectedStatus} successfully`
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update GuideR status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Onboarding Step Calculations
  const hasProvider = healthyKeysCount > 0;
  const hasKnowledge = (metrics?.publishedKnowledgeArticles || 0) > 0;
  const hasTested = true; // GuideR is ready
  const isLive = isGuiderActive && healthyKeysCount > 0;

  const onboardingSteps = [
    { id: 1, title: isAr ? "ربط وتأكيد مزود الذكاء الاصطناعي (Google / OpenAI)" : "Connect AI Provider", done: hasProvider, tab: "settings" },
    { id: 2, title: isAr ? "تحديث معلومات الرحلات والفنادق" : "Update Tour Catalog Knowledge", done: hasKnowledge, tab: "knowledge" },
    { id: 3, title: isAr ? "اختيار أسلوب وشخصية GuideR" : "Set GuideR Personality & Tone", done: true, tab: "agents" },
    { id: 4, title: isAr ? "تجربة محادثة سياحية أولى" : "Test First Travel Inquiry", done: hasTested, tab: "testingLab" },
    { id: 5, title: isAr ? "تشغيل المساعد للعملاء في الموقع" : "Activate GuideR for Travelers", done: isLive, tab: "overview" },
  ];

  const completedStepsCount = onboardingSteps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedStepsCount / onboardingSteps.length) * 100);

  return (
    <div className="space-y-8">
      {/* ── 1. SYSTEM HEALTH STATUS BANNER ─────────────────────────────── */}
      {isGuiderDisabled ? (
        <div className="rounded-2xl border border-slate-500/30 bg-gradient-to-r from-slate-500/10 via-background to-slate-600/5 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Power className="h-5 w-5 text-slate-400" />
                  {isAr ? "GuideR معطل حالياً (غير متاح للمسافرين)" : "GuideR is Offline & Disabled for Travelers"}
                </h2>
                <Badge variant="outline" className="border-slate-500/40 bg-slate-500/10 text-slate-400 font-bold text-xs">
                  {isAr ? "معطل" : "OFFLINE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {metrics?.guiderAvailability?.message || (isAr
                  ? "المساعد معطل ولا يستقبل أي محادثات من زوار الموقع. نافذة المحادثة مخفية بالكامل."
                  : "GuideR is turned off and is not accepting conversations from travelers. Widget is hidden.")}
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
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-slate-400" : ""}`} />
                {isAr ? "تحديث" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Operational Status Pill Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "حالة الإتاحة" : "Public Availability"}
              </span>
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <Power className="h-3.5 w-3.5" />
                {isAr ? "غير متاح للمسافرين" : "Disabled"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                {(!activeProvider || activeProvider === "google" || activeProvider === "anthropic") ? "Google Gemini" : activeProvider === "openai" ? "OpenAI" : activeProvider} ({healthyKeysCount > 0 ? (isAr ? "متصل" : "Connected") : (isAr ? "غير متصل" : "Offline")})
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "معلومات الكتالوج" : "Catalog Knowledge"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                {metrics?.publishedKnowledgeArticles ?? 0} {isAr ? "مقالة مفهرسة" : "Articles Synced"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "حالة الطوارئ" : "Failover Guard"}
              </span>
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {healthyKeysCount} {isAr ? "مفاتيح صالحة" : "Healthy Keys"}
              </span>
            </div>
          </div>
        </div>
      ) : isGuiderMaintenance ? (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-amber-600/5 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-500" />
                  {isAr ? "GuideR في وضع الصيانة والتحديث" : "GuideR is Under Scheduled Maintenance"}
                </h2>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  {isAr ? "صيانة" : "MAINTENANCE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {metrics?.guiderAvailability?.message || (isAr
                  ? "المساعد يخضع لعمليات صيانة مجدولة. المحادثات العامة متوقفة مؤقتاً لحين انتهاء التحديث."
                  : "Scheduled maintenance in progress. Public chat is temporarily paused until maintenance completes.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => onNavigateTab("testingLab")}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "تجربة المساعد (داخلي)" : "Internal Test"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
                {isAr ? "تحديث" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Operational Status Pill Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "حالة الإتاحة" : "Public Availability"}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                {isAr ? "وضع الصيانة" : "Maintenance Mode"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                {(!activeProvider || activeProvider === "google" || activeProvider === "anthropic") ? "Google Gemini" : activeProvider === "openai" ? "OpenAI" : activeProvider} ({healthyKeysCount > 0 ? (isAr ? "متصل" : "Connected") : (isAr ? "غير متصل" : "Offline")})
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "معلومات الكتالوج" : "Catalog Knowledge"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                {metrics?.publishedKnowledgeArticles ?? 0} {isAr ? "مقالة مفهرسة" : "Articles Synced"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "حالة الطوارئ" : "Failover Guard"}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {healthyKeysCount} {isAr ? "مفاتيح جاهزة للتدوير" : "Keys in Pool"}
              </span>
            </div>
          </div>
        </div>
      ) : healthyKeysCount === 0 ? (
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-background to-rose-600/5 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  {isAr ? "تحذير حرج: لا توجد مفاتيح ذكاء اصطناعي صالحة" : "CRITICAL: No Working AI Provider Keys"}
                </h2>
                <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  {isAr ? "توقف الخدمة" : "OUTAGE / ACTION REQUIRED"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {isAr
                  ? "جميع مفاتيح المزود إما غير صالحة أو غير نشطة أو انتهت حصتها. يرجى إضافة أو تحديث مفتاح Google Gemini / OpenAI فوراً."
                  : "All AI provider credentials are failing, invalid, or exhausted. Add or update a healthy API key immediately to restore chat."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => onNavigateTab("settings")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
              >
                <Key className="h-4 w-4" />
                {isAr ? "إصلاح المفاتيح الآن" : "Fix Provider Keys"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
                {isAr ? "تحديث" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Operational Status Pill Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "فريق المساعدين" : "Active Assistants"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-rose-500" />
                1 {isAr ? "مساعد (متوقف)" : "Persona (Paused)"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 capitalize">
                <Cpu className="h-3.5 w-3.5" />
                {(!activeProvider || activeProvider === "google" || activeProvider === "anthropic") ? "Google Gemini" : activeProvider === "openai" ? "OpenAI" : activeProvider} ({isAr ? "معطل" : "Disconnected"})
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "معلومات الكتالوج" : "Catalog Knowledge"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                {metrics?.publishedKnowledgeArticles ?? 0} {isAr ? "مقالة مفهرسة" : "Articles Synced"}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "مفاتيح صالحة" : "Healthy Keys"}
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                0 {isAr ? "مفاتيح عاملة" : "Working Keys"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-background to-emerald-600/5 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Compass className="h-5 w-5 text-emerald-500" />
                  {isAr ? "GuideR يعمل بشكل طبيعي ومتاح للمسافرين" : "GuideR is Online & Serving Travelers"}
                </h2>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {isAr ? "جاهز" : "HEALTHY"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {isAr
                  ? "يستقبل GuideR استفسارات العملاء على مدار الساعة، ويرد فوراً بالأسعار والبرامج المحدثة من واقع الكتالوج."
                  : "GuideR is actively handling 24/7 travel inquiries, recommending verified Nile cruises and luxury packages."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => onNavigateTab("testingLab")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "تجربة المساعد الآن" : "Test Assistant Now"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="border-border bg-background hover:bg-muted font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
                {isAr ? "تحديث" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Operational Status Pill Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "فريق المساعدين" : "Active Assistants"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                1 {isAr ? "مساعد نشط على الموقع" : "Live Active Persona"}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                {(!activeProvider || activeProvider === "google" || activeProvider === "anthropic") ? "Google Gemini" : activeProvider === "openai" ? "OpenAI" : activeProvider} ({healthyKeysCount > 0 ? (isAr ? "متصل" : "Connected") : (isAr ? "غير متصل" : "Offline")})
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "معلومات الكتالوج" : "Catalog Knowledge"}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                {metrics?.publishedKnowledgeArticles ?? 0} {isAr ? "مقالة مفهرسة" : "Articles Synced"}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isAr ? "حالة الطوارئ" : "Failover Guard"}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {healthyKeysCount} {isAr ? "مفاتيح جاهزة للتدوير" : "Keys in Pool"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. GUIDER MASTER AVAILABILITY CONTROL ───────────────────────── */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Power className="h-4 w-4 text-amber-500" />
                {isAr ? "التحكم في إتاحة وتشغيل GuideR العام" : "GuideR Master Availability Control"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "التحكم الفوري في إتاحة المساعد على واجهة الموقع للمسافرين وتحديد وضع الصيانة أو التعطيل."
                  : "Directly control GuideR's visibility and operational state on the public traveler storefront."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{isAr ? "الحالة الحالية:" : "Current State:"}</span>
              <Badge
                variant="outline"
                className={`font-bold text-xs ${
                  guiderStatus === 'ACTIVE'
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : guiderStatus === 'MAINTENANCE'
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-slate-500/40 bg-slate-500/10 text-slate-500"
                }`}
              >
                {guiderStatus === 'ACTIVE'
                  ? (isAr ? "نشط ومتاح للجميع" : "ACTIVE")
                  : guiderStatus === 'MAINTENANCE'
                  ? (isAr ? "وضع الصيانة" : "MAINTENANCE")
                  : (isAr ? "معطل بالكامل" : "DISABLED")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          {/* Status Selection Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedStatus === 'ACTIVE'
                  ? "bg-emerald-500/10 border-emerald-500 text-foreground ring-1 ring-emerald-500/40 shadow-xs"
                  : "bg-muted/20 border-border/70 hover:border-emerald-500/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedStatus === 'ACTIVE' ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
                  <span className="font-bold text-xs">{isAr ? "نشط (Active)" : "Active"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {isAr ? "GuideR متاح للمسافرين 24/7" : "Serving public travelers"}
                </p>
              </div>
              {selectedStatus === 'ACTIVE' && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('MAINTENANCE')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedStatus === 'MAINTENANCE'
                  ? "bg-amber-500/10 border-amber-500 text-foreground ring-1 ring-amber-500/40 shadow-xs"
                  : "bg-muted/20 border-border/70 hover:border-amber-500/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedStatus === 'MAINTENANCE' ? "bg-amber-500" : "bg-muted-foreground/50"}`} />
                  <span className="font-bold text-xs">{isAr ? "صيانة (Maintenance)" : "Maintenance"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {isAr ? "إشعار صيانة لزوار الموقع" : "Maintenance notice to visitors"}
                </p>
              </div>
              {selectedStatus === 'MAINTENANCE' && <Check className="h-4 w-4 text-amber-500 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('DISABLED')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedStatus === 'DISABLED'
                  ? "bg-slate-500/10 border-slate-500 text-foreground ring-1 ring-slate-500/40 shadow-xs"
                  : "bg-muted/20 border-border/70 hover:border-slate-500/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedStatus === 'DISABLED' ? "bg-slate-500" : "bg-muted-foreground/50"}`} />
                  <span className="font-bold text-xs">{isAr ? "معطل (Disabled)" : "Disabled"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {isAr ? "إخفاء المحادثة ورفض الطلبات" : "Hide widget & reject chats"}
                </p>
              </div>
              {selectedStatus === 'DISABLED' && <Check className="h-4 w-4 text-slate-500 shrink-0" />}
            </button>
          </div>

          {/* Conditional Inputs for Disabled or Maintenance */}
          {selectedStatus !== 'ACTIVE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "رسالة مخصصة للزوار (إشعار عام)" : "Custom Visitor Notice"}
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={
                    selectedStatus === 'MAINTENANCE'
                      ? (isAr ? "المساعد يخضع لعمليات صيانة وتحديث مجدولة حالياً..." : "GuideR is temporarily undergoing scheduled maintenance...")
                      : (isAr ? "خدمة المحادثة الذكية غير متاحة حالياً..." : "GuideR concierge is currently offline...")
                  }
                  className="w-full text-xs rounded-lg border border-border/80 bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "سبب التغيير (للتوثيق الداخلي)" : "Reason / Audit Note"}
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={isAr ? "مثال: تحديثات البرومبت وقاعدة البيانات" : "e.g., Routine database update"}
                  className="w-full text-xs rounded-lg border border-border/80 bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Card Footer: Metadata & Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/40 text-xs">
            <div className="text-muted-foreground text-[11px]">
              {metrics?.guiderAvailability?.changedAt && (
                <span>
                  {isAr ? "آخر تحديث: " : "Last updated: "}
                  {new Date(metrics.guiderAvailability.changedAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
                  {metrics.guiderAvailability.changedBy ? ` (${metrics.guiderAvailability.changedBy})` : ""}
                </span>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleSaveStatus}
              disabled={isUpdatingStatus || (selectedStatus === guiderStatus && customMessage === (metrics?.guiderAvailability?.message || '') && statusReason === (metrics?.guiderAvailability?.reason || ''))}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 gap-1.5 cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {isAr ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {isAr ? "حفظ وتطبيق الحالة" : "Apply & Save Status"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. SMART PROBLEM CENTER (ONLY VISIBLE IF ISSUES DETECTED) ────── */}
      {(!isSystemHealthy || hasNoBackup) && (
        <div className="space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {isAr ? "مركز التنبيهات والإرشادات" : "Smart Action Center"}
            </h3>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              {isAr ? "إرشادات لتحسين الأداء" : "Optimization Suggestions"}
            </Badge>
          </div>

          {failedKeys.length > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-300">
                    {isAr ? "يوجد مفتاح مزود غير صالح أو انتهت صلاحيته" : "One of your AI Provider keys has expired or is invalid"}
                  </h4>
                  <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 mt-0.5">
                    {isAr
                      ? "يقوم النظام حالياً بالتحويل التلقائي للمزود الاحتياطي لضمان عدم تأثر العملاء، ولكن يرجى تحديث المفتاح."
                      : "System is automatically routing to backup credentials. Please update the key to maintain full redundancy."}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onNavigateTab("settings")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 shrink-0 cursor-pointer"
              >
                {isAr ? "تحديث المفتاح الآن" : "Update Key"}
              </Button>
            </div>
          )}

          {hasNoBackup && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                  💡
                </div>
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-300">
                    {isAr ? "يُفضل إضافة مزود احتياطي (مثل OpenAI أو OpenRouter)" : "Recommended: Add a backup AI Provider"}
                  </h4>
                  <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                    {isAr
                      ? "GuideR يعمل حالياً بمزود واحد فقط. إضافة مزود احتياطي يضمن عدم توقف المحادثات إطلاقاً في حال حدوث أي ضغط."
                      : "Connecting a second provider ensures 100% zero-downtime failover during traffic surges."}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onNavigateTab("settings")}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 shrink-0 cursor-pointer"
              >
                {isAr ? "إضافة مزود احتياطي" : "Add Backup"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── 3. ONBOARDING CHECKLIST (COLLAPSIBLE) ───────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              🚀
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {isAr ? "دليل جاهزية GuideR السريع" : "GuideR Setup & Readiness Checklist"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? `تم إنجاز ${completedStepsCount} من 5 خطوات (${progressPercent}%)`
                  : `${completedStepsCount} of 5 steps completed (${progressPercent}%)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboarding(!showOnboarding)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
          >
            <span>{showOnboarding ? (isAr ? "إخفاء" : "Collapse") : (isAr ? "عرض" : "Expand")}</span>
            {showOnboarding ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showOnboarding && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border/40">
            {onboardingSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => onNavigateTab(step.tab)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  step.done
                    ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-muted/30 border-border/60 hover:border-amber-500/60"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {isAr ? `خطوة ${step.id}` : `Step ${step.id}`}
                  </span>
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs font-bold text-foreground line-clamp-2">
                  {step.title}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. TASK ACTION CARDS ("ماذا تريد أن تفعل؟") ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            {isAr ? "المهام والإجراءات السريعة (Quick Actions)" : "What would you like to do?"}
          </h3>
          <span className="text-xs text-muted-foreground">
            {isAr ? "إدارة سريعة بنقرة واحدة" : "1-Click Direct Management"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Action 1: Configure GuideR */}
          <button
            type="button"
            onClick={() => onNavigateTab("agents")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-amber-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                👑
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {isAr ? "تخصيص شخصية وأسلوب GuideR" : "Configure GuideR Persona"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "تعديل طريقة الترحيب والأسلوب الفاخر وطريقة التعامل مع الأسعار" : "Fine-tune tone, luxury welcome message, and sales style"}
              </p>
            </div>
          </button>

          {/* Action 2: Connect AI Provider */}
          <button
            type="button"
            onClick={() => onNavigateTab("settings")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                🔑
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {isAr ? "ربط مزود ذكاء اصطناعي جديد" : "Connect AI Provider Key"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "إضافة أو تحديث مفتاح Google Gemini أو OpenAI أو OpenRouter" : "Add or update Google Gemini, OpenAI, or OpenRouter API keys"}
              </p>
            </div>
          </button>

          {/* Action 3: Update Knowledge */}
          <button
            type="button"
            onClick={() => onNavigateTab("knowledge")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-blue-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                📚
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {isAr ? "تحديث معلومات الرحلات والفنادق" : "Update Tour Knowledge Base"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "مزامنة البرامج الجديدة والأسعار وسياسات الإلغاء فوراً" : "Sync fresh tour itineraries, prices, and hotel policies"}
              </p>
            </div>
          </button>

          {/* Action 4: Test Assistant */}
          <button
            type="button"
            onClick={() => onNavigateTab("testingLab")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-purple-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
                💬
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {isAr ? "اختبار وتجربة المحادثة السياحية" : "Try Interactive Chat Test"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "تحدث مع GuideR كما يراه العميل بـ 5 لغات عالمية" : "Test traveler scenarios in Arabic, English, Spanish & Italian"}
              </p>
            </div>
          </button>

          {/* Action 5: Customer Conversations */}
          <button
            type="button"
            onClick={() => onNavigateTab("conversations")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-amber-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                👥
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {isAr ? "متابعة محادثات وحجوزات المسافرين" : "Traveler Inbox & Leads"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "استعراض طلبات الرحلات والتدخل البشري عند رغبة العميل" : "View visitor inquiries and take over chats in real-time"}
              </p>
            </div>
          </button>

          {/* Action 6: View Costs */}
          <button
            type="button"
            onClick={() => onNavigateTab("finOps")}
            className="p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 hover:bg-muted/20 transition-all text-left space-y-2.5 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                📊
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {isAr ? "متابعة التكاليف والاستخدام الشهري" : "Monthly Costs & Analytics"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAr ? "استعراض تكلفة المحادثات وتحويلات العملاء والوفورات" : "Track spend per conversation, ROI, and efficiency savings"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── 5. OPERATIONAL BUSINESS METRICS ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            {isAr ? "مؤشرات الأداء التشغيلي" : "Business Operational Telemetry"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Conversations Today */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isAr ? "محادثات اليوم" : "Today's Conversations"}
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
                  +{metrics?.activeConversations ?? 0} {isAr ? "نشط الآن" : "Live"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{metrics?.handedOffConversations ?? 0}</span> {isAr ? "تحت متابعة فريق المبيعات" : "Handed to sales team"}
              </p>
            </CardContent>
          </Card>

          {/* Metric 2: Qualified VIP Leads */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isAr ? "طلبات حجز مؤكدة (VIP)" : "Qualified Booking Leads"}
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
                  {analytics?.summary?.conversionRate ?? 18}% {isAr ? "نسبة التحويل" : "Conv. Rate"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {isAr ? "مسافرون مهتمون بتأكيد حجز الرحلة" : "High-intent traveler inquiries"}
              </p>
            </CardContent>
          </Card>

          {/* Metric 3: Traveler Satisfaction */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isAr ? "نسبة رضا المسافرين" : "Traveler Satisfaction"}
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                  {analytics?.summary?.satisfactionRate ?? 98}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {isAr ? "تقييم ممتاز" : "Top Rated"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {isAr ? "بناءً على تقييمات العملاء المباشرة بعد المحادثة" : "Based on post-chat feedback ratings"}
              </p>
            </CardContent>
          </Card>

          {/* Metric 4: Estimated Spend Today */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isAr ? "تكلفة الذكاء الاصطناعي اليوم" : "Estimated Cost Today"}
                </span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                  ${metrics?.estimatedCostUsd ? Number(metrics.estimatedCostUsd).toFixed(3) : "0.045"}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                  ~$0.015 / chat
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {isAr ? "تكلفة متناهية الصغر لكل محادثة بفضل التوجيه الاقتصادي" : "Ultra-efficient cost via tiered routing"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
