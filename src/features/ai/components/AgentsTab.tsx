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
  ShieldCheck, 
  Cpu, 
  Languages, 
  Layers, 
  Check, 
  X, 
  Sliders, 
  Calendar, 
  DollarSign, 
  Compass, 
  Crown, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Eye, 
  Save, 
  Zap,
  BookOpen,
  Database,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { AgentItemData, aiApi } from "../api/aiApi";

const DEFAULT_GUIDER_PROMPT = `You are GuideR, the premier luxury AI Travel Concierge for Dunas Travel.
You represent the pinnacle of bespoke Egyptian hospitality.
Adhere strictly to these principles:
1. ONLY recommend real tours, hotels, and services available in Dunas Travel's grounded catalog.
2. Ground all dynamic facts (prices, dates, availability) in live structured data.
3. Respond in the exact language the traveler used (Arabic, English, Spanish, Portuguese, Italian).
4. For custom multi-day plans, provide structured day-by-day itineraries with private transfers, 5-star accommodations, and private Egyptologist guides.`;

const DEFAULT_GUIDELINES = "التحدث بأسلوب راقي جداً، التركيز على الراحة، الدهبيات الخاصة، وأجنحة كبار الشخصيات.";

interface AgentsTabProps {
  agents: AgentItemData[];
  activeSystemPrompt?: string;
  activePersonality?: string;
  onRefresh: () => void;
  onNavigateToLab: (agentSlug: string) => void;
  t: any;
  isAr: boolean;
}

export function AgentsTab({
  agents,
  activeSystemPrompt,
  activePersonality,
  onRefresh,
  onNavigateToLab,
  t,
  isAr,
}: AgentsTabProps) {
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentItemData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State for Persona / Prompt
  const [slug, setSlug] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [avatar, setAvatar] = useState("👑");
  const [role, setRole] = useState("مستشار سياحي فاخر");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [personalityGuidelines, setPersonalityGuidelines] = useState("");
  const [tone, setTone] = useState("فاخر واحترافي");

  // Determine Active Persona (Single active assistant on site)
  const activeAgent = (Array.isArray(agents) && agents.find((a) => a.isActive)) || (agents?.[0] || null);

  // Activate Single Agent Handler
  const handleActivateAgent = async (agent: AgentItemData) => {
    if (agent.isActive) return;
    setActivatingId(agent.id);
    try {
      await aiApi.activateAgent(agent.id);
      toast.success(
        isAr 
          ? `تم تفعيل "${agent.nameJsonb?.ar || agent.displayName || agent.slug}" كمساعد وحيد ونشط على الموقع العام!` 
          : `Activated "${agent.nameJsonb?.en || agent.displayName || agent.slug}" as the single live assistant!`
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to activate agent.");
    } finally {
      setActivatingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (agent: AgentItemData) => {
    setIsCreatingNew(false);
    setEditingAgent(agent);
    setSlug(agent.slug);
    setNameAr(agent.nameJsonb?.ar || agent.name || "");
    setNameEn(agent.nameJsonb?.en || agent.name || "");
    setDescAr(agent.descriptionJsonb?.ar || agent.description || "");
    setDescEn(agent.descriptionJsonb?.en || agent.description || "");
    setAvatar(agent.avatar || "👑");
    setRole(agent.role || "مستشار سياحي فاخر");

    // Smart Fallback: If agent.systemPrompt is empty/null, load from live config or default preset
    const resolvedPrompt = 
      (agent.systemPrompt && agent.systemPrompt.trim().length > 0)
        ? agent.systemPrompt
        : (activeSystemPrompt && activeSystemPrompt.trim().length > 0)
        ? activeSystemPrompt
        : DEFAULT_GUIDER_PROMPT;
    setSystemPrompt(resolvedPrompt);

    // Smart Fallback: If agent.personalityGuidelines is empty/null, load from live config or default preset
    const resolvedGuidelines = 
      (agent.personalityGuidelines && agent.personalityGuidelines.trim().length > 0)
        ? agent.personalityGuidelines
        : (activePersonality && activePersonality.trim().length > 0)
        ? activePersonality
        : DEFAULT_GUIDELINES;
    setPersonalityGuidelines(resolvedGuidelines);

    setTone(agent.tone || "فاخر واحترافي");
    setShowModal(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setIsCreatingNew(true);
    setEditingAgent(null);
    const newSlug = `persona-${Date.now().toString(36)}`;
    setSlug(newSlug);
    setNameAr("مستشار الرحلات الملكية VIP");
    setNameEn("VIP Luxury Advisor");
    setDescAr("مستشار مخصص لتخطيط البرامج السياحية الفاخرة وتأجير الدهبيات الخاصة.");
    setDescEn("Dedicated luxury travel advisor for bespoke VIP vacations and private Dahabiyas.");
    setAvatar("💎");
    setRole("مستشار سياحي ملكي");
    setTone("فاخر واحترافي بأسلوب ضيافة فورسيزونز");
    setPersonalityGuidelines("التحدث بأسلوب راقي جداً، التركيز على الراحة، الدهبيات الخاصة، وأجنحة كبار الشخصيات.");
    setSystemPrompt(`You are GuideR (VIP Luxury Concierge) for Dunas Travel.
You represent the pinnacle of bespoke Egyptian hospitality.
1. Welcome guests with refined elegance.
2. Recommend private Dahabiyas, luxury 5-star Nile cruises, and presidential accommodations.
3. Ground all suggestions strictly in Dunas Travel verified tour catalog.`);
    setShowModal(true);
  };

  // Save Persona / Prompt Handler
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !systemPrompt.trim()) {
      toast.error(isAr ? "يرجى كتابة الاسم وتعليمات البرومبت." : "Please provide name and system prompt.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<AgentItemData> = {
        slug,
        nameJsonb: { ar: nameAr.trim(), en: nameEn.trim() || nameAr.trim() },
        descriptionJsonb: { ar: descAr.trim(), en: descEn.trim() || descAr.trim() },
        avatar,
        role,
        tone,
        personalityGuidelines,
        systemPrompt,
        primaryModel: "gemini-3.5-flash",
      };

      if (isCreatingNew) {
        await aiApi.createAgent(payload);
        toast.success(isAr ? "تم إنشاء الشخصية والبرومبت بنجاح!" : "Persona created successfully!");
      } else if (editingAgent) {
        await aiApi.updateAgent(editingAgent.id, payload);
        // If this agent is currently the active live assistant on the website, sync to AiConfig systemInstructions directly
        if (editingAgent.isActive || activeAgent?.id === editingAgent.id) {
          await aiApi.updateConfig({ 
            systemInstructions: systemPrompt.trim(),
            salesPersonality: personalityGuidelines.trim() || undefined,
            toneOfVoice: tone.trim() || undefined
          }).catch(() => null);
        }
        toast.success(isAr ? "تم حفظ التعديلات وتحديث البرومبت!" : "Persona updated successfully!");
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save persona.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Persona Handler
  const handleDeleteAgent = async (agent: AgentItemData) => {
    if (agent.slug === "guider") {
      toast.error(isAr ? "لا يمكن حذف شخصية جايد آر الافتراضية." : "Cannot delete default GuideR persona.");
      return;
    }
    if (!confirm(isAr ? `هل أنت متأكد من حذف الشخصية "${agent.nameJsonb?.ar || agent.name}"؟` : `Delete persona "${agent.name}"?`)) return;

    try {
      await aiApi.deleteAgent(agent.id);
      toast.success(isAr ? "تم حذف الشخصية بنجاح." : "Persona deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete persona.");
    }
  };

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* ── 1. ACTIVE LIVE ASSISTANT HERO BANNER ─────────────────────────── */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-background p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {isAr ? "المساعد النشط والوحيد على الموقع حالياً (Live on Website)" : "Single Active Assistant on Live Website"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-center text-2xl">
                {activeAgent?.avatar || "👑"}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  {isAr ? (activeAgent?.nameJsonb?.ar || activeAgent?.name || "GuideR (الكونسيرج الملكي)") : (activeAgent?.nameJsonb?.en || activeAgent?.name || "GuideR (Royal Concierge)")}
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold border-none px-2">
                    {isAr ? "نشط وفعال 100%" : "Live Active"}
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                  {isAr 
                    ? (activeAgent?.descriptionJsonb?.ar || activeAgent?.description || "المستشار السياحي المعتمد للرد على جميع استفسارات وتفاصيل الحجوزات في مصر.") 
                    : (activeAgent?.descriptionJsonb?.en || activeAgent?.description || "Primary luxury AI concierge handling all live traveler inquiries.")}
                </p>
              </div>
            </div>

            {/* Live Model & Grounding Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/80 font-bold text-foreground">
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                Google Gemini (gemini-3.5-flash)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/80 font-semibold text-muted-foreground">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                {isAr ? "متصل بالكتالوج والرحلات المباشرة" : "Grounded with Live Catalog"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/80 font-semibold text-muted-foreground">
                <Languages className="h-3.5 w-3.5 text-amber-500" />
                {isAr ? "يتحدث 5 لغات بطلاقة" : "Fluent in 5 Languages"}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {activeAgent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(activeAgent)}
                className="h-10 px-4 text-xs font-bold gap-2 cursor-pointer bg-card hover:bg-muted border-border/80"
              >
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                {isAr ? "تعديل البرومبت والتعليمات" : "Edit System Prompt"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onNavigateToLab(activeAgent?.slug || "guider")}
              className="h-10 px-5 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {isAr ? "تجربة المساعد الآن" : "Test in Live Lab"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. CURATED PERSONA TEMPLATES & PRESETS ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              {isAr ? "قوالب شخصيات وأسلوب GuideR المتاحة" : "Available GuideR Personas & Prompt Presets"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "اختر شخصية واحدة فقط لتكون هي المساعد النشط على الموقع بضغطة زر واحدة."
                : "Select exactly ONE persona to be the active live assistant on the website."}
            </p>
          </div>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-9 text-xs font-bold gap-1.5 bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            {isAr ? "إضافة شخصية / برومبت جديد" : "Add Custom Persona"}
          </Button>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(agents) && agents.map((agent) => {
            const isActive = activeAgent?.id === agent.id;
            const isActivating = activatingId === agent.id;

            return (
              <Card
                key={agent.id}
                className={`relative transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/30 shadow-sm"
                    : "border-border/70 bg-card hover:border-border hover:shadow-xs"
                }`}
              >
                {/* Active Indicator Top Stripe */}
                {isActive && (
                  <div className="h-1.5 w-full bg-emerald-500 absolute top-0 left-0" />
                )}

                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl shadow-xs border ${
                        isActive ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/40 border-border/80"
                      }`}>
                        {agent.avatar || "👑"}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {isAr ? (agent.nameJsonb?.ar || agent.name) : (agent.nameJsonb?.en || agent.name)}
                        </CardTitle>
                        <span className="text-[11px] font-semibold text-muted-foreground block mt-0.5">
                          {agent.role || (isAr ? "مستشار سياحي" : "Travel Advisor")}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                        🟢 {isAr ? "النشط حالياً" : "Live Active"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px] font-semibold">
                        {isAr ? "غير مفعل" : "Standby"}
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="text-xs mt-3 leading-relaxed line-clamp-2">
                    {isAr ? (agent.descriptionJsonb?.ar || agent.description) : (agent.descriptionJsonb?.en || agent.description)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Prompt Tone & Guidelines Pill */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground font-semibold">
                      <span>{isAr ? "نبرة الصوت والأسلوب:" : "Tone & Style:"}</span>
                      <span className="font-bold text-foreground">{agent.tone || "فاخر واحترافي"}</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] line-clamp-1 italic">
                      &quot;{agent.personalityGuidelines || (isAr ? "الضيافة الملكية وتقديم أفضل العروض." : "Luxury hospitality and VIP services.")}&quot;
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(agent)}
                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{isAr ? "معاينة وتعديل" : "Edit"}</span>
                      </Button>

                      {agent.slug !== "guider" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {isActive ? (
                      <Button
                        size="sm"
                        disabled
                        className="h-8 px-3 text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 cursor-default"
                      >
                        <Check className="h-3.5 w-3.5 ml-1" />
                        {isAr ? "مفعل في الموقع" : "Active"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleActivateAgent(agent)}
                        disabled={isActivating}
                        className="h-8 px-3 text-xs font-bold gap-1 bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-xs"
                      >
                        <Zap className={`h-3.5 w-3.5 text-amber-400 ${isActivating ? "animate-spin" : ""}`} />
                        <span>{isAr ? "تفعيل على الموقع" : "Activate"}</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── 3. SIMPLIFIED CATALOG KNOWLEDGE EXPLANATION ─────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
        <div className="flex items-center gap-2 text-foreground font-bold text-xs">
          <BookOpen className="h-4 w-4 text-purple-500" />
          <span>{isAr ? "كيف يعمل GuideR مع معلومات موقعك؟" : "How GuideR Uses Your Tour Catalog"}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isAr
            ? "أياً كانت الشخصية أو البرومبت الذي تفعله، فإن GuideR يقرأ تلقائياً من كتالوج الرحلات، الفنادق، وسياسات الحجز المنشورة على موقعك قبل الرد على أي مسافر، لضمان دقة الأسعار والمواعيد بنسبة 100% دون أي اختلاق."
            : "Regardless of which persona you activate, GuideR automatically grounds all answers in your live tours, stays, and booking policies before responding to travelers."}
        </p>
      </div>

      {/* ── 4. PERSONA & PROMPT MODAL (CREATE / EDIT) ────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in-50 zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                  {avatar || "👑"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {isCreatingNew 
                      ? (isAr ? "إضافة شخصية وبرومبت جديد لـ GuideR" : "Add New GuideR Persona & Prompt") 
                      : (isAr ? "تعديل برومبت وتعليمات المساعد" : "Edit Persona & System Prompt")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "تخصيص أسلوب المحادثة والقواعد التي يلتزم بها المساعد." : "Configure conversation guidelines and behavior rules."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Ar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {isAr ? "اسم الشخصية (بالعربي)*" : "Persona Name (Arabic)*"}
                  </label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: جايد آر (المستشار الملكي)"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                {/* Avatar Icon */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {isAr ? "الأيقونة (Emoji)" : "Icon / Emoji"}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="h-9 text-xs w-20 text-center font-bold text-lg"
                      maxLength={2}
                    />
                    <div className="flex items-center gap-1 text-sm">
                      {["👑", "💎", "📅", "📜", "🛡️", "🌟"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAvatar(emoji)}
                          className="h-8 w-8 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Ar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isAr ? "الوصف المختصر (يظهر في لوحة التحكم)" : "Short Description"}
                </label>
                <Input
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  placeholder="مثال: المستشار السياحي المعتمد للرحلات الملكية الفاخرة وكروز النيل."
                  className="h-9 text-xs"
                />
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isAr ? "نبرة الصوت والأسلوب" : "Tone of Voice"}
                </label>
                <Input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="مثال: فاخر واحترافي بضيافة ملكية"
                  className="h-9 text-xs"
                />
              </div>

              {/* Personality Guidelines */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isAr ? "توجيهات السلوك والشخصية" : "Personality Guidelines"}
                </label>
                <Input
                  value={personalityGuidelines}
                  onChange={(e) => setPersonalityGuidelines(e.target.value)}
                  placeholder="مثال: التحدث بأسلوب راقي، التركيز على الدهبيات الخاصة وأجنحة كبار الشخصيات."
                  className="h-9 text-xs"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>{isAr ? "تعليمات البرومبت الكاملة (System Prompt)*" : "Full System Prompt Instructions*"}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Google Gemini Instructions</span>
                </label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={8}
                  placeholder="اكتب تعليمات المساعد بدقة هنا..."
                  className="text-xs font-mono leading-relaxed"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "هذه هي التعليمات الأساسية التي يعتمدها الذكاء الاصطناعي أثناء الإجابة على كل استفسار."
                    : "These are the core system instructions guiding the AI responses."}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="h-9 text-xs font-bold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="h-9 text-xs font-bold gap-1.5 bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ البرومبت" : "Save Prompt")}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
