"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Shield, 
  Cpu, 
  Languages, 
  Layers, 
  Check, 
  X, 
  Sliders, 
  Settings2,
  Calendar,
  DollarSign,
  Compass,
  MessageSquare,
  Crown,
  ChevronRight,
  Info,
  CheckCircle2,
  HelpCircle,
  MoreVertical,
  Play,
  RotateCcw,
  Sparkle,
  Users,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { AgentItemData, aiApi } from "../api/aiApi";

interface AgentsTabProps {
  agents: AgentItemData[];
  onRefresh: () => void;
  onNavigateToLab: (agentSlug: string) => void;
  t: any;
  isAr: boolean;
}

// Visual and Personality Metadata for DUNAS Agents
const AGENT_PERSONA_PRESETS: Record<
  string,
  {
    icon: string;
    badge: string;
    tonePreset: string;
    guidelinesAr: string;
    guidelinesEn: string;
    qualityTier: "economy" | "balanced" | "premium";
  }
> = {
  luxury_concierge: {
    icon: "👑",
    badge: "Royal Concierge",
    tonePreset: "فاخر واحترافي",
    guidelinesAr: "التحدث بأسلوب راقي جداً وضيافة ملكية، التركيز على الراحة والدهبيات الخاصة وأجنحة كبار الشخصيات.",
    guidelinesEn: "Speak with effortless luxury hospitality, highlighting private Nile Dahabiyas and presidential suites.",
    qualityTier: "balanced",
  },
  egyptologist: {
    icon: "📜",
    badge: "Egyptologist",
    tonePreset: "قصصي وتاريخي مشوق",
    guidelinesAr: "شرح أسرار الحضارة الفرعونية والمعابد والمقابر بأسلوب علمي وقصصي ممتع.",
    guidelinesEn: "Deep historical storytelling about Pharaohs, Karnak, and ancient dynasties connected to guided tours.",
    qualityTier: "balanced",
  },
  sales_concierge: {
    icon: "💎",
    badge: "VIP Advisor",
    tonePreset: "مستشار مبيعات ذكي",
    guidelinesAr: "الاستماع لاحتياجات العميل ومساعدته على اختيار أفضل باقة سياحية وتأكيد موعد الحجز.",
    guidelinesEn: "Understand traveler preferences, recommend ideal packages, and facilitate booking confirmation.",
    qualityTier: "balanced",
  },
  booking_specialist: {
    icon: "📅",
    badge: "Booking Specialist",
    tonePreset: "مباشر وسريع",
    guidelinesAr: "التحقق من تواريخ السفر وعدد الأفراد وتفاصيل حجز الفنادق والرحلات بسرعة ودقة.",
    guidelinesEn: "Validate traveler counts, trip duration, hotel preferences, and booking dates with clear precision.",
    qualityTier: "economy",
  },
  support_agent: {
    icon: "🛡️",
    badge: "Customer Care",
    tonePreset: "ودود ومتعاون",
    guidelinesAr: "مساعدة المسافر في الاستفسارات العامة وسياسات الإلغاء والدفع والتأشيرات.",
    guidelinesEn: "Provide warm, responsive support regarding payments, visa advice, pickup logistics, and policies.",
    qualityTier: "economy",
  },
};

export function AgentsTab({
  agents,
  onRefresh,
  onNavigateToLab,
  t,
  isAr,
}: AgentsTabProps) {
  const [editingAgent, setEditingAgent] = useState<AgentItemData | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State (Human-friendly)
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [role, setRole] = useState("مستشار سفر فاخر");
  const [avatar, setAvatar] = useState("👑");
  const [tonePreset, setTonePreset] = useState("فاخر واحترافي");
  const [responseStyle, setResponseStyle] = useState<"precise" | "balanced" | "creative">("balanced");
  const [qualityProfile, setQualityProfile] = useState<"economy" | "balanced" | "premium">("balanced");
  const [personalityGuidelines, setPersonalityGuidelines] = useState("");
  const [allowedSources, setAllowedSources] = useState<string[]>(["tours", "destinations", "policies", "hotels"]);
  const [isActive, setIsActive] = useState(true);

  // Open Create Wizard
  const openCreateWizard = () => {
    setEditingAgent(null);
    setSlug(`agent-${Date.now().toString(36)}`);
    setNameEn("VIP Luxury Advisor");
    setNameAr("مستشار الرحلات الملكية VIP");
    setDescEn("Dedicated advisor for custom VIP tour planning and private Dahabiya charters.");
    setDescAr("مستشار مخصص لتخطيط الرحلات الفاخرة لكبار الشخصيات والدهبيات النيلية.");
    setRole("مستشار سياحي ملكي");
    setAvatar("👑");
    setTonePreset("فاخر واحترافي");
    setResponseStyle("balanced");
    setQualityProfile("balanced");
    setPersonalityGuidelines("التحدث بأسلوب راقي جداً وتقديم خيارات الضيافة الفاخرة.");
    setAllowedSources(["tours", "destinations", "policies", "hotels"]);
    setIsActive(true);
    setWizardStep(1);
    setShowWizard(true);
  };

  // Open Edit Wizard
  const openEditWizard = (agent: AgentItemData) => {
    setEditingAgent(agent);
    setSlug(agent.slug);
    setNameEn(agent.nameJsonb?.en || agent.displayName || "");
    setNameAr(agent.nameJsonb?.ar || "");
    setDescEn(agent.descriptionJsonb?.en || agent.displayDescription || "");
    setDescAr(agent.descriptionJsonb?.ar || "");
    setRole(agent.role || "مستشار سياحي");
    setAvatar(agent.avatar || "👑");
    setPersonalityGuidelines(agent.personalityGuidelines || "");
    setAllowedSources(agent.allowedSources || ["tours", "destinations", "policies"]);
    setIsActive(agent.isActive);

    // Map temperature to human response style
    if (agent.temperature <= 0.4) setResponseStyle("precise");
    else if (agent.temperature >= 0.8) setResponseStyle("creative");
    else setResponseStyle("balanced");

    // Quality profile
    if (agent.primaryModel?.includes("lite") || agent.primaryModel?.includes("mini")) {
      setQualityProfile("economy");
    } else if (agent.primaryModel?.includes("pro") || agent.primaryModel?.includes("3.7") || agent.primaryModel?.includes("o3")) {
      setQualityProfile("premium");
    } else {
      setQualityProfile("balanced");
    }

    setWizardStep(1);
    setShowWizard(true);
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Map human responseStyle back to temperature internally
    const temperatureVal = responseStyle === "precise" ? 0.3 : responseStyle === "creative" ? 0.9 : 0.7;

    // Map human qualityProfile back to recommended primaryModel internally
    let resolvedModel = "gemini-2.5-flash";
    if (qualityProfile === "economy") resolvedModel = "gemini-2.5-flash";
    else if (qualityProfile === "premium") resolvedModel = "gpt-4o";

    try {
      const payload = {
        slug: slug.trim(),
        nameJsonb: { en: nameEn.trim() || "AI Assistant", ar: nameAr.trim() || nameEn.trim() },
        descriptionJsonb: { en: descEn.trim(), ar: descAr.trim() },
        role: role.trim(),
        avatar,
        tone: tonePreset,
        personalityGuidelines: personalityGuidelines.trim(),
        primaryModel: resolvedModel,
        fallbackModels: ["gpt-4o-mini", "deepseek/deepseek-chat-v3-0324"],
        temperature: temperatureVal,
        maxTokens: 1200,
        allowedSources,
        allowedTools: ["search_catalog", "check_availability", "tailor_itinerary", "book_tour"],
        supportedLanguages: ["en", "ar", "es", "pt", "it"],
        defaultLanguage: "en",
        isActive,
        isPublic: true,
      };

      if (editingAgent) {
        await aiApi.updateAgent(editingAgent.id, payload);
        toast.success(isAr ? "تم تحديث بيانات المساعد بنجاح!" : "Assistant updated successfully!");
      } else {
        await aiApi.createAgent(payload);
        toast.success(isAr ? "تم إنشاء المساعد الجديد بنجاح!" : "New assistant created successfully!");
      }

      setShowWizard(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save assistant.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف المساعد "${name}"؟` : `Delete assistant "${name}"?`)) return;
    setDeletingId(id);
    try {
      await aiApi.deleteAgent(id);
      toast.success(isAr ? "تم حذف المساعد." : "Assistant removed.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete agent.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSource = (src: string) => {
    setAllowedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            {isAr ? "فريق المساعدين الأذكياء (AI Travel Team)" : "AI Travel Assistants Team"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "مساعدون متخصصون يقدمون خدمة الضيافة الفاخرة والرد على استفسارات الرحلات بـ 5 لغات عالمية."
              : "Specialized digital assistants delivering white-glove luxury concierge service in 5 languages."}
          </p>
        </div>

        <Button
          onClick={openCreateWizard}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {isAr ? "إضافة مساعد جديد" : "Add New Assistant"}
        </Button>
      </div>

      {/* ── AGENT CARDS GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(Array.isArray(agents) ? agents : []).map((agent) => {
          const isGuideR = agent?.slug === "guider";
          const personaMeta = AGENT_PERSONA_PRESETS[agent.slug] || {
            icon: agent.avatar || "👑",
            badge: "Specialist",
            tonePreset: "فاخر واحترافي",
            guidelinesAr: agent.personalityGuidelines || "",
            guidelinesEn: agent.personalityGuidelines || "",
            qualityTier: "balanced" as const,
          };

          const displayName = isAr
            ? agent.nameJsonb?.ar || agent.displayName || agent.slug
            : agent.nameJsonb?.en || agent.displayName || agent.slug;

          const displayDesc = isAr
            ? agent.descriptionJsonb?.ar || agent.displayDescription || agent.role
            : agent.descriptionJsonb?.en || agent.displayDescription || agent.role;

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-amber-500/50 relative overflow-hidden ${
                isGuideR ? "ring-1 ring-amber-500/40 bg-gradient-to-b from-amber-500/5 to-card" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-2xs">
                      {personaMeta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{displayName}</h3>
                        {isGuideR && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {agent.role || (isAr ? "مستشار سياحي" : "Travel Specialist")}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {agent.isActive ? (
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                      ● {isAr ? "نشط" : "Active"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted text-muted-foreground text-[10px] shrink-0">
                      {isAr ? "متوقف" : "Paused"}
                    </Badge>
                  )}
                </div>

                {/* Purpose Bio */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {displayDesc}
                </p>

                {/* Human Specs Summary */}
                <div className="rounded-xl bg-muted/30 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isAr ? "مستوى الجودة:" : "Quality Profile:"}</span>
                    <span className="font-bold text-foreground">
                      {personaMeta.qualityTier === "economy"
                        ? isAr ? "اقتصادي وسريع" : "Economy & Fast"
                        : personaMeta.qualityTier === "premium"
                        ? isAr ? "أعلى جودة واستنتاج" : "Premium / Advanced"
                        : isAr ? "متوازن — موصى به" : "Balanced (Recommended)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isAr ? "مصادر المعرفة:" : "Knowledge Sources:"}</span>
                    <span className="font-bold text-foreground">
                      {agent.allowedSources?.length || 4} {isAr ? "مصادر متصلة" : "Sources Connected"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isAr ? "أسلوب الرد:" : "Conversation Style:"}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {agent.tone || personaMeta.tonePreset || (isAr ? "فاخر واحترافي" : "Royal Luxury")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openEditWizard(agent)}
                    className="h-8 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/80 cursor-pointer shadow-2xs gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {isAr ? "تعديل" : "Edit"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateToLab(agent.slug)}
                    className="h-8 text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isAr ? "تجربة المحادثة" : "Test Chat"}
                  </Button>
                </div>

                {!isGuideR && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAgent(agent.id, displayName)}
                    disabled={deletingId === agent.id}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4-STEP GUIDED WIZARD MODAL ───────────────────────────────────── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden space-y-0">
            {/* Wizard Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  {wizardStep}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {wizardStep === 1 && (isAr ? "الخطوة 1: الهوية والمسمى الوظيفي" : "Step 1: Identity & Role")}
                    {wizardStep === 2 && (isAr ? "الخطوة 2: الشخصية وأسلوب الحديث" : "Step 2: Personality & Tone")}
                    {wizardStep === 3 && (isAr ? "الخطوة 3: مصادر المعرفة المتاحة" : "Step 3: Available Knowledge")}
                    {wizardStep === 4 && (isAr ? "الخطوة 4: مستوى الجودة والسرعة" : "Step 4: Quality & Speed Profile")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {wizardStep === 1 && (isAr ? "تحديد اسم المساعد ودوره في خدمة العملاء" : "Define the assistant name and travel role")}
                    {wizardStep === 2 && (isAr ? "كيف يجب أن يتحدث المساعد مع المسافرين؟" : "How should this assistant communicate with guests?")}
                    {wizardStep === 3 && (isAr ? "حدد المعلومات التي يستطيع المساعد الاطلاع عليها" : "Select the catalogs and policies this assistant can access")}
                    {wizardStep === 4 && (isAr ? "اختر مستوى الذكاء المطلوب دون تعقيدات تقنية" : "Select intelligence profile without technical complexity")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWizard(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: IDENTITY & ROLE */}
            {wizardStep === 1 && (
              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      {isAr ? "الاسم بالعربية" : "Arabic Name"}
                    </label>
                    <Input
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder="e.g. مستشار الرحلات الفاخرة"
                      className="h-9 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                      {isAr ? "الاسم بالإنجليزية" : "English Name"}
                    </label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. VIP Travel Advisor"
                      className="h-9 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "المسمى الوظيفي" : "Role / Title"}
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. مستشار سياحي ملكي"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "الرمز التعبيري / الأيقونة" : "Avatar Symbol"}
                  </label>
                  <div className="flex items-center gap-2">
                    {["👑", "📜", "💎", "📅", "🛡️", "🧭", "🌟"].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setAvatar(sym)}
                        className={`h-10 w-10 rounded-xl border text-lg flex items-center justify-center transition-all cursor-pointer ${
                          avatar === sym ? "border-amber-500 bg-amber-500/20 ring-1 ring-amber-500" : "border-border/80 hover:bg-muted"
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    {isAr ? "نبذة مختصرة عن وظيفته" : "Purpose Summary"}
                  </label>
                  <Textarea
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    placeholder="e.g. يساعد العملاء على تخطيط الرحلات الملكية والدهبيات الخاصة."
                    rows={2}
                    className="text-xs"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWizard(false)}
                    className="h-9 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{isAr ? "التالي: أسلوب الحديث ←" : "Next: Tone & Style →"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: PERSONALITY & TONE */}
            {wizardStep === 2 && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-2">
                    {isAr ? "اختر نمط التحدث (Tone Preset)" : "Select Communication Tone"}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { title: "فاخر واحترافي", desc: "ضيافة ملكية راقية وأسلوب مهذب جداً", icon: "👑" },
                      { title: "ودود وبسيط", desc: "أسلوب دافئ ومرحب وسهل الفهم", icon: "😊" },
                      { title: "مباشر وسريع", desc: "إجابات موجزة ومحددة للأرقام والمواعيد", icon: "⚡" },
                      { title: "مستشار مبيعات", desc: "يركز على إقناع العميل وتأكيد الحجز", icon: "💎" },
                      { title: "رسمي وموثوق", desc: "للسياسات والشروط والأسئلة القانونية", icon: "📜" },
                    ].map((preset) => {
                      const isSelected = tonePreset === preset.title;
                      return (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setTonePreset(preset.title);
                            setPersonalityGuidelines(preset.desc);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                              : "border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <span>{preset.icon}</span>
                              {preset.title}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-amber-500" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Response Style (Replacing Temperature!) */}
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-2">
                    {isAr ? "أسلوب الإجابات (Response Style)" : "Answer Style"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "precise", label: isAr ? "دقيق ومحافظ" : "Strict & Precise", desc: "ملتزم حرفياً بالنصوص" },
                      { id: "balanced", label: isAr ? "متوازن — موصى به" : "Balanced (Best)", desc: "سلس وجذاب" },
                      { id: "creative", label: isAr ? "إبداعي وجذاب" : "Creative & Rich", desc: "تعبير غني ووصف ملهم" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setResponseStyle(st.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-0.5 ${
                          responseStyle === st.id
                            ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                            : "border-border/80 hover:bg-muted/40"
                        }`}
                      >
                        <span className="font-bold text-xs text-foreground block">{st.label}</span>
                        <span className="text-[10px] text-muted-foreground block">{st.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep(1)}
                    className="h-9 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? "← السابق" : "← Back"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{isAr ? "التالي: مصادر المعرفة ←" : "Next: Knowledge Sources →"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: KNOWLEDGE SOURCES */}
            {wizardStep === 3 && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-2">
                    {isAr ? "المعلومات المسموح للمساعد بالاطلاع عليها:" : "Allowed Business Catalogs:"}
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "tours", title: "الرحلات والبرامج السياحية (Tours)", desc: "جداول الرحلات، الأسعار، المزارات اليومية، والدهبيات", icon: "🚢" },
                      { id: "hotels", title: "الفنادق والإقامة الفاخرة (Hotels)", desc: "بيانات الفنادق 5 نجوم، أنواع الغرف، ومستويات الخدمة", icon: "🏨" },
                      { id: "transportation", title: "خدمات النقل والسيارات (Transport)", desc: "الليموزين، النقل الخاص، واستقبال المطار VIP", icon: "🚗" },
                      { id: "destinations", title: "الوجهات والمعالم (Destinations)", desc: "القاهرة، الأقصر، أسوان، الغردقة، وشرم الشيخ", icon: "🏛️" },
                      { id: "policies", title: "السياسات والتأشيرات (Policies & FAQ)", desc: "سياسة الإلغاء، شروط الدفع، ومعلومات الفيزا", icon: "📋" },
                    ].map((src) => {
                      const isChecked = allowedSources.includes(src.id);
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => toggleSource(src.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between w-full ${
                            isChecked
                              ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                              : "border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{src.icon}</span>
                            <div>
                              <span className="font-bold text-xs text-foreground block">{src.title}</span>
                              <span className="text-[10px] text-muted-foreground block">{src.desc}</span>
                            </div>
                          </div>
                          {isChecked ? (
                            <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep(2)}
                    className="h-9 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? "← السابق" : "← Back"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{isAr ? "التالي: مستوى الجودة ←" : "Next: Quality Profile →"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: QUALITY PROFILE & SAVE */}
            {wizardStep === 4 && (
              <form onSubmit={handleSaveAgent} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase text-[10px] text-muted-foreground block mb-2">
                    {isAr ? "اختر مستوى الذكاء والسرعة (Quality Profile):" : "Select Intelligence Tier:"}
                  </label>
                  <div className="space-y-2.5">
                    {[
                      {
                        id: "balanced",
                        title: isAr ? "متوازن — موصى به لـ GuideR" : "Balanced (Recommended)",
                        desc: isAr ? "أفضل توازن بين الفهم اللغوي الراقي والسرعة الفائقة والتكلفة المنخفضة." : "Optimal balance of intelligence, response speed, and low operating cost.",
                        badge: "Recommended",
                        cost: "~$0.015 / chat",
                        icon: "✨",
                      },
                      {
                        id: "economy",
                        title: isAr ? "اقتصادي وفائق السرعة" : "Economy & Ultra Fast",
                        desc: isAr ? "ممتاز لخدمة العملاء والأسئلة الشائعة والتحقق من التواريخ بأقل تكلفة ممكنة." : "Best for high-volume customer service, booking dates, and policies.",
                        badge: "Fast & Light",
                        cost: "~$0.005 / chat",
                        icon: "⚡",
                      },
                      {
                        id: "premium",
                        title: isAr ? "أعلى جودة واستنتاج" : "Premium / Advanced Reasoning",
                        desc: isAr ? "لتركيب البرامج السياحية المعقدة متعددة المدن وحساب الميزانيات الدقيقة." : "For multi-city itinerary synthesis and complex custom travel constraints.",
                        badge: "Advanced",
                        cost: "~$0.040 / chat",
                        icon: "💎",
                      },
                    ].map((tier) => {
                      const isSelected = qualityProfile === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setQualityProfile(tier.id as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 w-full ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500 shadow-xs"
                              : "border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <span>{tier.icon}</span>
                              {tier.title}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {tier.cost}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{tier.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "🔒 يتكفل النظام تلقائياً بتحديد المزود الأفضل وإدارة التدوير الذاتي دون الحاجة لضبط تقني."
                      : "🔒 System automatically resolves provider failover and parameters securely."}
                  </span>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep(3)}
                    className="h-9 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? "← السابق" : "← Back"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWizard(false)}
                      className="h-9 text-xs font-bold cursor-pointer"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                    >
                      {saving
                        ? isAr ? "جاري الحفظ..." : "Saving..."
                        : editingAgent
                        ? isAr ? "حفظ التعديلات" : "Save Changes"
                        : isAr ? "إنشاء المساعد وتفعيله" : "Create & Activate"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
