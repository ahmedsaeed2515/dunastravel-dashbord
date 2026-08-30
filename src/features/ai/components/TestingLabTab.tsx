"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Send, 
  Cpu, 
  Database, 
  Activity, 
  Layers, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Bot, 
  FileCode2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RotateCcw,
  Sliders,
  Compass,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { AgentItemData, DiagnosticTraceResponse, aiApi } from "../api/aiApi";
import { ModelSelector } from "./ModelSelector";

interface TestingLabTabProps {
  agents: AgentItemData[];
  initialAgentSlug?: string;
  t: any;
  isAr: boolean;
}

export function TestingLabTab({
  agents,
  initialAgentSlug = "guider",
  t,
  isAr,
}: TestingLabTabProps) {
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(initialAgentSlug);
  const [selectedModel, setSelectedModel] = useState("claude-3-5-sonnet-20241022");
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [enableRag, setEnableRag] = useState(true);
  const [enableLiveDb, setEnableLiveDb] = useState(true);

  const [message, setMessage] = useState("I am looking for a 8-day luxury Nile cruise from Cairo to Luxor and Aswan for a family of 4. What are the available dates and starting prices?");
  const [running, setRunning] = useState(false);
  const [traceResult, setTraceResult] = useState<DiagnosticTraceResponse | null>(null);

  const testPresets = [
    {
      label: isAr ? "رحلة كروز نيلية 8 أيام (عربي)" : "8-Day Nile Cruise (AR)",
      msg: "أبحث عن برنامج سياحي فاخر 8 أيام يشمل القاهرة والنايل كروز لعائلة مكونة من 4 أفراد، ما هي الأسعار المتاحة؟",
      locale: "ar",
      agent: "guider",
    },
    {
      label: isAr ? "حجز مباشر وتأكيد موعد (إنجليزي)" : "Booking & Dates (EN)",
      msg: "I want to confirm a reservation for the Classic Egypt 8 Days tour starting October 15th for 2 adults.",
      locale: "en",
      agent: "booking_specialist",
    },
    {
      label: isAr ? "تأجير دهبية خاصة VIP (إسباني)" : "Private Dahabiya (ES)",
      msg: "Queremos alquilar una Dahabiya privada exclusiva para 6 personas por 5 días en el Nilo.",
      locale: "es",
      agent: "sales_concierge",
    },
    {
      label: isAr ? "سياسة الإلغاء والدفع (برتغالي)" : "Cancellation & Policy (PT)",
      msg: "Quais são as políticas de cancelamento e reembolso para pacotes de luxo?",
      locale: "pt",
      agent: "support_agent",
    },
    {
      label: isAr ? "تاريخ توت عنخ آمون والكرنك (إيطالي)" : "Tutankhamun & Karnak (IT)",
      msg: "Raccontami la storia della tomba di Tutankhamon e del tempio di Karnak a Luxor.",
      locale: "it",
      agent: "egyptologist",
    },
  ];

  const handleApplyPreset = (preset: any) => {
    setMessage(preset.msg);
    setSelectedLocale(preset.locale);
    setSelectedAgentSlug(preset.agent);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setRunning(true);
    try {
      const res = await aiApi.runSimulatorTrace({
        message: message.trim(),
        agentSlug: selectedAgentSlug,
        model: selectedModel,
        locale: selectedLocale,
        enableRag,
        enableLiveDb,
      });

      setTraceResult(res);
      toast.success(isAr ? "تم تنفيذ المحاكاة واستخراج التتبع التشخيصي!" : "Simulation completed with full diagnostic trace!");
    } catch (err: any) {
      toast.error(err?.message || "Simulation failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {t("testingLab.title")}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("testingLab.subtitle")}
        </p>
      </div>

      {/* Main Grid: Control Panel vs Diagnostic Trace Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls & Simulator Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                {isAr ? "إعدادات المحاكاة والفحص" : "Simulation Configuration"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Agent Personality Selector */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("testingLab.selectAgent")}
                </label>
                <select
                  value={selectedAgentSlug}
                  onChange={(e) => setSelectedAgentSlug(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                >
                  {agents.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.avatar} {a.displayName || a.nameJsonb?.en || a.slug} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selector */}
              <ModelSelector
                provider="anthropic"
                value={selectedModel}
                onChange={(m) => setSelectedModel(m)}
                label={t("testingLab.selectModel")}
                isAr={isAr}
              />

              {/* Visitor Locale */}
              <div>
                <label className="font-semibold uppercase text-muted-foreground block mb-1">
                  {t("testingLab.selectLocale")}
                </label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                >
                  <option value="en">English (EN)</option>
                  <option value="ar">العربية (AR)</option>
                  <option value="es">Español (ES)</option>
                  <option value="pt">Português (PT)</option>
                  <option value="it">Italiano (IT)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-foreground">
                    {t("testingLab.enableRag")}
                  </span>
                  <input
                    type="checkbox"
                    checked={enableRag}
                    onChange={(e) => setEnableRag(e.target.checked)}
                    className="accent-amber-500 h-4 w-4 rounded cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-foreground">
                    {t("testingLab.enableLiveDb")}
                  </span>
                  <input
                    type="checkbox"
                    checked={enableLiveDb}
                    onChange={(e) => setEnableLiveDb(e.target.checked)}
                    className="accent-amber-500 h-4 w-4 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick Preset Queries */}
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {isAr ? "استفسارات تجريبية سريعة" : "Quick Test Presets"}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {testPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 cursor-pointer transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input & Run Form */}
              <form onSubmit={handleRunSimulation} className="space-y-3 pt-2">
                <div>
                  <label className="font-semibold uppercase text-muted-foreground block mb-1">
                    {isAr ? "رسالة المسافر الافتراضية" : "Simulation Traveler Message"}
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={t("testingLab.chatPlaceholder")}
                    className="font-medium text-xs resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={running || !message.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {running ? (isAr ? "جاري الفحص واستخراج التتبع..." : "Running Diagnostics Trace...") : t("testingLab.sendTest")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Output & Deep Inspection Trace Drawer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {traceResult ? (
            <Card className="border-border/60 bg-card shadow-md space-y-4 p-5 animate-in fade-in">
              {/* Top Answer Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{traceResult.agent.avatar || "🤖"}</span>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {traceResult.agent.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {traceResult.model.id} • {traceResult.telemetry.totalLatencyMs}ms
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    ${traceResult.telemetry.estimatedCostUsd.toFixed(4)} USD
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground text-xs leading-relaxed font-medium whitespace-pre-wrap">
                  {traceResult.answer}
                </div>
              </div>

              {/* Diagnostic Trace Accordion / Inspection Panels */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  {t("testingLab.diagnosticsTrace")}
                </h4>

                {/* Telemetry Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">{t("testingLab.tokensUsed")}:</span>
                    <span className="font-mono font-bold text-foreground">
                      {traceResult.telemetry.totalTokens} ({traceResult.telemetry.inputTokens} in / {traceResult.telemetry.outputTokens} out)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{t("testingLab.costEstimate")}:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      ${traceResult.telemetry.estimatedCostUsd.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{t("testingLab.retrievalLatency")}:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {traceResult.retrieval.latencyMs}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{t("testingLab.providerLatency")}:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {traceResult.telemetry.providerLatencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Grounded Live Tours from DB */}
                {traceResult.retrieval.groundedTours?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                      {isAr ? "الرحلات الحية المؤصلة من قاعدة البيانات" : "Grounded Real Tours (PostgreSQL)"}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {traceResult.retrieval.groundedTours.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{t.title}</span>
                            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">${t.basePriceUsd}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block">
                            {t.durationDays} Days • {t.city} • <code>{t.publicUrl}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Multilingual Chunks */}
                {traceResult.retrieval.matchedChunks?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                      {t("testingLab.ragChunksRetrieved")}:
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {traceResult.retrieval.matchedChunks.map((c, idx) => (
                        <div key={idx} className="p-2 rounded-lg border border-border bg-muted/20 text-[11px] space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{c.title}</span>
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">{c.locale}</span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compiled System Prompt Snippet */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {isAr ? "البرومبت المؤصل المنشأ للموديل" : "Compiled System Prompt with Injected Grounding"}:
                  </span>
                  <pre className="p-3 rounded-lg bg-black/80 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36 whitespace-pre-wrap">
                    {traceResult.prompt.compiledSystemPrompt}
                  </pre>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-border/60 p-12 text-center text-muted-foreground text-xs h-[500px] flex items-center justify-center">
              {isAr 
                ? "اضغط على 'بدء الفحص والتشخيص' لمحاكاة المحادثة وعرض التتبع الشامل لقرارات الذكاء الاصطناعي." 
                : "Click 'Run Simulation Trace' to simulate a traveler query and inspect full model decisions, RAG retrieval scores, and FinOps costs."}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
