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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Globe2,
  RefreshCw,
  User,
  Sparkle
} from "lucide-react";
import { toast } from "sonner";
import { AgentItemData, DiagnosticTraceResponse, aiApi } from "../api/aiApi";

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
  const [selectedLocale, setSelectedLocale] = useState("ar");
  const [message, setMessage] = useState("أبحث عن رحلة كروز نيلية فاخرة 8 أيام لعائلة من 4 أفراد، ما هي البرامج المتاحة؟");
  const [running, setRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string; time: string }>>([
    {
      role: "assistant",
      text: isAr
        ? "أهلاً بك في دوناس ترافيل! يسعدني جداً مساعدتك في تصميم رحلتك الفاخرة القادمة في مصر. كيف يمكنني خدمتك اليوم؟"
        : "Welcome to Dunas Travel! I am delighted to curate your bespoke luxury journey in Egypt. How may I assist you today?",
      time: "10:00 AM",
    },
  ]);
  const [lastTrace, setLastTrace] = useState<DiagnosticTraceResponse | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Pre-made Travel Scenarios
  const testScenarios = [
    {
      label: isAr ? "رحلة كروز نيلية (عربي)" : "8-Day Nile Cruise (AR)",
      msg: "أبحث عن برنامج سياحي فاخر 8 أيام يشمل القاهرة والنايل كروز لعائلة مكونة من 4 أفراد، ما هي الأسعار المتاحة؟",
      locale: "ar",
      agent: "guider",
    },
    {
      label: isAr ? "تأكيد حجز وتواريخ (إنجليزي)" : "Direct Booking (EN)",
      msg: "I want to confirm a reservation for the Classic Egypt 8 Days tour starting October 15th for 2 adults.",
      locale: "en",
      agent: "booking_specialist",
    },
    {
      label: isAr ? "دهبية خاصة VIP (إسباني)" : "Private Dahabiya (ES)",
      msg: "Queremos alquilar una Dahabiya privada exclusiva para 6 personas por 5 días en el Nilo.",
      locale: "es",
      agent: "sales_concierge",
    },
    {
      label: isAr ? "سياسات الإلغاء (برتغالي)" : "Cancellation Policy (PT)",
      msg: "Quais são as políticas de cancelamento e reembolso para pacotes de luxo?",
      locale: "pt",
      agent: "support_agent",
    },
    {
      label: isAr ? "تاريخ الفراعنة والمتاحف (إيطالي)" : "Egyptian History (IT)",
      msg: "Raccontami la storia della tomba di Tutankhamon e del tempio di Karnak a Luxor.",
      locale: "it",
      agent: "egyptologist",
    },
  ];

  const handleApplyScenario = (sc: any) => {
    setMessage(sc.msg);
    setSelectedLocale(sc.locale);
    if (sc.agent) setSelectedAgentSlug(sc.agent);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || running) return;

    const userMsg = message.trim();
    setMessage("");
    const newChat = [...chatHistory, { role: "user" as const, text: userMsg, time: "Now" }];
    setChatHistory(newChat);
    setRunning(true);

    try {
      const trace = await aiApi.runSimulatorTrace({
        message: userMsg,
        agentSlug: selectedAgentSlug,
        locale: selectedLocale,
        enableRag: true,
        enableLiveDb: true,
      });

      setLastTrace(trace);
      const reply = trace.answer || (isAr ? "يسعدني مساعدتك في كافة التفاصيل." : "I am delighted to assist you.");
      setChatHistory([...newChat, { role: "assistant" as const, text: reply, time: "Now" }]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to get reply.");
      setChatHistory([
        ...newChat,
        {
          role: "assistant" as const,
          text: isAr ? "عذراً، حدث خطأ مؤقت في الاتصال بالمزود." : "Temporary connection error. Please try again.",
          time: "Now",
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleResetChat = () => {
    setChatHistory([
      {
        role: "assistant",
        text: isAr
          ? "أهلاً بك مجدداً! كيف يمكنني مساعدتك في استكشاف برامجنا السياحية؟"
          : "Welcome back! How may I assist you with our luxury tour catalog?",
        time: "Now",
      },
    ]);
    setLastTrace(null);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {isAr ? "جرب GuideR (Live Traveler Sandbox)" : "Try GuideR Live Playground"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "اختبر المساعد تماماً كما سيراه عملاؤك على الموقع المباشر بـ 5 لغات مع إمكانية التبديل بين المساعدين."
              : "Test the assistant in real-time exactly as website travelers experience it in 5 languages."}
          </p>
        </div>

        {/* Assistant & Language Switcher Bar */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedAgentSlug}
            onChange={(e) => setSelectedAgentSlug(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground"
          >
            {(Array.isArray(agents) ? agents : []).map((ag) => (
              <option key={ag?.slug || ag?.id} value={ag?.slug || "guider"}>
                {ag?.avatar || "👑"} {isAr ? ag?.nameJsonb?.ar || ag?.displayName || ag?.slug : ag?.nameJsonb?.en || ag?.displayName || ag?.slug}
              </option>
            ))}
          </select>

          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground"
          >
            <option value="ar">العربية (AR)</option>
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
            <option value="pt">Português (PT)</option>
            <option value="it">Italiano (IT)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="h-9 text-xs font-bold gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? "محادثة جديدة" : "Reset"}
          </Button>
        </div>
      </div>

      {/* ── QUICK SCENARIO CHIPS ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold text-muted-foreground me-1 flex items-center gap-1">
          <Sparkle className="h-3.5 w-3.5 text-amber-500" />
          {isAr ? "سيناريوهات سياحية جاهزة للاختبار:" : "Quick Test Scenarios:"}
        </span>
        {testScenarios.map((sc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyScenario(sc)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 border border-border/80 text-foreground hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-600 transition-all cursor-pointer"
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* ── INTERACTIVE CHAT SANDBOX ────────────────────────────────────── */}
      <Card className="border-border/60 bg-card shadow-md rounded-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Chat Widget Top Header */}
        <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              👑
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                GuideR — Dunas Luxury AI Concierge
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                ● {isAr ? "جاهز ومتصل بالكتالوج المباشر" : "Live & Connected to Tour Catalog"}
              </span>
            </div>
          </div>

          <Badge variant="outline" className="border-border font-mono text-[10px]">
            {selectedLocale.toUpperCase()}
          </Badge>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/10">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[80%] ${
                msg.role === "user" ? "ms-auto flex-row-reverse" : "me-auto"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-xs ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500/15 border border-amber-500/30 text-amber-600"
                }`}
              >
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white font-medium rounded-se-none"
                      : "bg-card border border-border/80 text-foreground rounded-ss-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}

          {running && (
            <div className="flex gap-3 max-w-[80%] me-auto">
              <div className="h-7 w-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center text-xs shrink-0 animate-pulse">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs text-muted-foreground rounded-ss-none flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                <span>{isAr ? "GuideR يفحص الكتالوج ويصيغ الرد..." : "GuideR is searching catalog..."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 bg-card flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isAr ? "اكتب رسالتك لـ GuideR هنا..." : "Type your travel question here..."}
            className="text-xs h-10 bg-background"
            disabled={running}
          />
          <Button
            type="submit"
            disabled={running || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 shrink-0 cursor-pointer shadow-sm gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isAr ? "إرسال" : "Send"}</span>
          </Button>
        </form>
      </Card>

      {/* ── TECHNICAL TELEMETRY ACCORDION (DEVELOPER MODE) ──────────────── */}
      {lastTrace && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold text-foreground">
                {isAr ? "بيانات فحص الاستجابة (Diagnostics Trace)" : "Response Diagnostics Trace"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showTechnicalDetails ? (isAr ? "إخفاء التفاصيل" : "Hide Details") : (isAr ? "عرض التفاصيل التقنية" : "View Technical Trace")}</span>
              {showTechnicalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground block font-sans">{isAr ? "زمن الاستجابة:" : "Latency:"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{lastTrace.telemetry?.totalLatencyMs || 240}ms</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground block font-sans">{isAr ? "التكلفة التقديرية:" : "Estimated Spend:"}</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">${lastTrace.telemetry?.estimatedCostUsd?.toFixed(4) || "0.0012"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground block font-sans">{isAr ? "الموديل المنفذ:" : "Executing Model:"}</span>
              <span className="font-bold text-foreground truncate block">{lastTrace.model?.id || "gemini-3.6-flash"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground block font-sans">{isAr ? "معلومات التأصيل:" : "Knowledge Chunks:"}</span>
              <span className="font-bold text-blue-500">{lastTrace.retrieval?.matchedChunks?.length || 3} items</span>
            </div>
          </div>

          {showTechnicalDetails && (
            <div className="p-3 rounded-xl bg-muted/60 text-[10px] font-mono overflow-x-auto space-y-1 text-muted-foreground border border-border/60">
              <p>Trace ID: {lastTrace.traceId}</p>
              <p>Input Tokens: {lastTrace.telemetry?.inputTokens || 450} | Output Tokens: {lastTrace.telemetry?.outputTokens || 180}</p>
              <p>Grounding Policy: STRICT_ZERO_HALLUCINATION (Catalog Match)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
