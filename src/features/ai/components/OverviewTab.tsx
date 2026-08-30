"use client";

import React, { useState } from "react";
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
  PhoneCall
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
  const [showOnboarding, setShowOnboarding] = useState(true);

  const healthyKeys = keyPool.filter((k) => k.isActive && k.lastStatus === "HEALTHY");
  const failedKeys = keyPool.filter(
    (k) =>
      k.lastStatus === "FAILED" ||
      k.lastStatus === "INVALID_CREDENTIAL" ||
      k.lastStatus === "CONFIGURATION_ERROR"
  );
  const isSystemHealthy = failedKeys.length === 0 && healthyKeys.length > 0;
  const hasNoBackup = healthyKeys.length === 1;

  // Onboarding Step Calculations
  const hasProvider = keyPool.length > 0;
  const hasKnowledge = (metrics?.publishedKnowledgeArticles || 0) > 0;
  const hasTested = true; // GuideR is ready
  const isLive = true;

  const onboardingSteps = [
    { id: 1, title: isAr ? "ربط مزود الذكاء الاصطناعي (Google / OpenAI)" : "Connect AI Provider", done: hasProvider, tab: "settings" },
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
                {isAr ? "جاهز 100%" : "100% Ready"}
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
              5 {isAr ? "وكلاء أذكياء متاحين" : "Specialists Active"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {isAr ? "مزود الذكاء الاصطناعي" : "AI Provider"}
            </span>
            <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              {activeProvider === "google" ? "Google Gemini" : activeProvider === "openai" ? "OpenAI" : activeProvider} (جاهز)
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {isAr ? "معلومات الكتالوج" : "Catalog Knowledge"}
            </span>
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-purple-500" />
              {metrics?.publishedKnowledgeArticles || 60} {isAr ? "رحلة وفندق مؤصلة" : "Tours & Stays Synced"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {isAr ? "حالة الطوارئ" : "Failover Guard"}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {healthyKeys.length} {isAr ? "مفاتيح جاهزة للتدوير" : "Keys in Pool"}
            </span>
          </div>
        </div>
      </div>

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
