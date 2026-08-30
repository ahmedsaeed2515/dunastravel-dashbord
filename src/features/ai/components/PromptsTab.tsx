"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode2, 
  Plus, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Layers, 
  Trash2, 
  Edit3, 
  Copy, 
  X,
  Code2,
  Check,
  ShieldAlert,
  Info,
  Sliders,
  ChevronDown,
  ChevronUp,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { PromptVersionItem, aiApi } from "../api/aiApi";

interface PromptsTabProps {
  onRefresh: () => void;
  onNavigateToLab: (agentSlug?: string) => void;
  t: any;
  isAr: boolean;
}

export function PromptsTab({ onRefresh, onNavigateToLab, t, isAr }: PromptsTabProps) {
  const [prompts, setPrompts] = useState<PromptVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersionItem | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);

  // Simple Sectional State
  const [welcomeTone, setWelcomeTone] = useState("ضيافة ملكية راقية بأسلوب رئيس الكونسيرج في فورسيزونز");
  const [mustDoRules, setMustDoRules] = useState(
    "- الترحيب بالمسافر باللغة التي بدأ بها المحادثة فوراً.\n- تقديم برامج النايل كروز والدهبيات الفاخرة المعتمدة.\n- الاستفسار بلطف عن عدد الأفراد وتواريخ السفر المفضلة."
  );
  const [mustNotDoRules, setMustNotDoRules] = useState(
    "- عدم اختلاق أي أسعار أو رحلات غير موجودة في الكتالوج المباشر نهائياً.\n- عدم استخدام لغة عامية أو مصطلحات غير لائقة بمستوى الفخامة.\n- عدم إعطاء وعود بتأكيد الحجز قبل إتمام الإجراءات مع فريق المبيعات."
  );
  const [pricingRules, setPricingRules] = useState("ذكر الأسعار التقديرية بالدولار مع توضيح أنها تشمل الإقامة والوجبات والتنقلات الفاخرة.");
  const [bookingRules, setBookingRules] = useState("عند رغبة العميل في الحجز، تجميع بيانات الاسم، الهاتف، التواريخ، وتقديم زر التأكيد المباشر.");

  // Raw Prompt State (Advanced)
  const [rawPromptText, setRawPromptText] = useState("");

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const data = await aiApi.getPromptVersions();
      setPrompts(data || []);
      if (data && data.length > 0 && !selectedPrompt) {
        const published = data.find((p) => p.status === "PUBLISHED") || data[0];
        setSelectedPrompt(published);
        setRawPromptText(published.systemPrompt);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load prompt versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleSelectPreset = (preset: { tone: string; mustDo: string; mustNot: string }) => {
    setWelcomeTone(preset.tone);
    setMustDoRules(preset.mustDo);
    setMustNotDoRules(preset.mustNot);
    toast.success(isAr ? "تم تطبيق النمط المختار!" : "Preset applied!");
  };

  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const assembledPrompt = `You are GuideR, the premier luxury AI Travel Concierge for Dunas Travel.

TONE & WELCOME:
${welcomeTone}

CORE BEHAVIOR RULES (MUST DO):
${mustDoRules}

SAFETY & RESTRICTIONS (MUST NOT DO):
${mustNotDoRules}

PRICING POLICY:
${pricingRules}

BOOKING & RESERVATION ACTIONS:
${bookingRules}

LANGUAGE DIRECTIVE:
Always reply in the exact language used by the visitor (Arabic, English, Spanish, Portuguese, Italian).`;

    try {
      await aiApi.createPromptDraft({
        name: `Rules Update — ${new Date().toLocaleDateString()}`,
        systemPrompt: assembledPrompt,
        changeNote: "Updated via Simple Admin Instructions editor",
      });

      toast.success(isAr ? "✓ تم حفظ وتحديث تعليمات GuideR بنجاح!" : "✓ Instructions saved and updated!");
      fetchPrompts();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save instructions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-indigo-400" />
            {isAr ? "أسلوب وتعليمات المساعد (Assistant Rules & Tone)" : "Assistant Instructions & Rules"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "التحكم في طريقة حديث GuideR، قواعد الرد على الأسعار، والشروط التي يجب الالتزام بها دون الحاجة لكتابة كود."
              : "Easily configure how GuideR talks, what it should or shouldn't do, and how it handles bookings."}
          </p>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground me-1">
            {isAr ? "أنماط جاهزة:" : "Presets:"}
          </span>
          <button
            type="button"
            onClick={() =>
              handleSelectPreset({
                tone: "ضيافة ملكية راقية بأسلوب رئيس الكونسيرج في فورسيزونز",
                mustDo: "- الترحيب الفوري بالمسافر بأسلوب فخم.\n- اقتراح الدهبيات الخاصة وأجنحة كبار الشخصيات.\n- السؤال بلطف عن تواريخ السفر المفضلة.",
                mustNot: "- عدم اختلاق أي أسعار غير موجودة في الكتالوج.\n- تجنب العامية نهائياً.",
              })
            }
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-all"
          >
            👑 {isAr ? "الضيافة الملكية VIP" : "Royal Luxury"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleSelectPreset({
                tone: "مستشار مبيعات سياحي ذكي وسريع الإقناع",
                mustDo: "- إبراز القيمة الممتازة للبرامج السياحية.\n- مساعدة العميل على اتخاذ قرار الحجز الفوري.\n- توضيح تواريخ الرحلات المتاحة.",
                mustNot: "- عدم الإلحاح المزعج.\n- عدم تخفيض الأسعار دون موافقة الإدارة.",
              })
            }
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer transition-all"
          >
            💎 {isAr ? "مستشار مبيعات الحجوزات" : "Sales Advisor"}
          </button>
        </div>
      </div>

      {/* ── SIMPLE SECTIONAL INSTRUCTIONS FORM ───────────────────────────── */}
      <form onSubmit={handleSaveSections} className="space-y-4">
        {/* Section 1: Welcome & Tone */}
        <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>🎭</span>
              {isAr ? "طريقة الحديث ونبرة الصوت (Tone & Voice)" : "Tone of Voice & Welcome Style"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isAr ? "كيف يرحب GuideR بالمسافرين في بداية كل محادثة؟" : "How should GuideR greet and converse with guests?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <Input
              value={welcomeTone}
              onChange={(e) => setWelcomeTone(e.target.value)}
              className="text-xs h-9 bg-background"
            />
          </CardContent>
        </Card>

        {/* Section 2: Must Do & Must Not Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {isAr ? "ما الذي يجب أن يفعله دائماً؟ (Must Do)" : "Core Actions (Must Do)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={mustDoRules}
                onChange={(e) => setMustDoRules(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed bg-background"
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {isAr ? "ما الذي لا يجب أن يفعله نهائياً؟ (Must NOT Do)" : "Safety Guardrails (Must NOT Do)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={mustNotDoRules}
                onChange={(e) => setMustNotDoRules(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed bg-background"
              />
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Pricing & Booking Handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>💰</span>
                {isAr ? "طريقة التعامل مع الأسعار والعروض" : "Pricing Policy"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={pricingRules}
                onChange={(e) => setPricingRules(e.target.value)}
                rows={3}
                className="text-xs leading-relaxed bg-background"
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>📅</span>
                {isAr ? "طريقة التعامل مع طلبات الحجز المباشر" : "Booking & Lead Capture Rules"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={bookingRules}
                onChange={(e) => setBookingRules(e.target.value)}
                rows={3}
                className="text-xs leading-relaxed bg-background"
              />
            </CardContent>
          </Card>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="text-xs text-muted-foreground">
            {isAr ? "يتم تفعيل التعليمات فوراً لجميع محادثات GuideR القادمة." : "Changes apply immediately to upcoming conversations."}
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ وتفعيل التعليمات" : "Save & Apply Instructions")}
          </Button>
        </div>
      </form>

      {/* ── ADVANCED DEVELOPER PROMPT VERSIONING (COLLAPSIBLE) ──────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-4 w-4 text-purple-500" />
            {isAr ? "استوديو البرومبت والنسخ المتقدم (Developer Prompt Studio)" : "Developer Prompt Studio & Versioning"}
          </span>
          <button
            type="button"
            onClick={() => setShowAdvancedEditor(!showAdvancedEditor)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvancedEditor ? (isAr ? "إخفاء" : "Hide") : (isAr ? "عرض محرر الكود الخام" : "Show Raw Prompt Code")}</span>
            {showAdvancedEditor ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showAdvancedEditor && (
          <div className="pt-3 border-t border-border/40 space-y-3 text-xs">
            <Textarea
              value={rawPromptText}
              onChange={(e) => setRawPromptText(e.target.value)}
              rows={8}
              className="font-mono text-xs bg-muted/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
