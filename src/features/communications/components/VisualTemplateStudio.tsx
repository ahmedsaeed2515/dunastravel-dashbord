"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Monitor, 
  Smartphone, 
  Send, 
  Save, 
  Palette, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  Code, 
  Check, 
  Copy, 
  Image as ImageIcon,
  MousePointerClick,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { 
  EmailTemplate, 
  EmailDesignConfig, 
  PresetId 
} from "../types";
import { 
  EMAIL_PRESETS, 
  compileTemplateHtml, 
  extractDesignConfigFromHtml, 
  simulateTemplateWithVariables 
} from "../utils/emailCompiler";
import { useSendTestEmail } from "../hooks/useCommunications";

interface VisualTemplateStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSave: (payload: { name: string; subject: string; bodyHtml: string; variables: string[] }) => void;
  isSaving?: boolean;
}

const AVAILABLE_VARIABLES = [
  { key: "{{name}}", label: "اسم العميل (Name)" },
  { key: "{{otpCode}}", label: "رمز التحقق (OTP)" },
  { key: "{{verifyUrl}}", label: "رابط التفعيل (Verify URL)" },
  { key: "{{bookingRef}}", label: "رقم الحجز (Booking Ref)" },
  { key: "{{tourTitle}}", label: "اسم الرحلة (Tour Title)" },
  { key: "{{date}}", label: "التاريخ (Date)" },
  { key: "{{amount}}", label: "المبلغ (Amount)" },
];

const STANDARD_PLATFORM_TEMPLATES = [
  { name: "user_verification", label: "🔐 تفعيل الحساب والبريد (OTP Verification)", desc: "يُرسل فور تسجيل العميل للتحقق من هويته عبر رمز الـ OTP" },
  { name: "booking_customer_confirmation", label: "🎟️ تأكيد حجز العميل (Booking Confirmation)", desc: "يُرسل عند تأكيد الحجز وإتمام الدفع للرحلة" },
  { name: "welcome_onboarding", label: "✨ ترحيب العضو الجديد (Welcome VIP)", desc: "رسالة ترحيبية فورية بالعميل في عائلة ديوناز ترافيل" },
];

export function VisualTemplateStudio({
  open,
  onOpenChange,
  template,
  onSave,
  isSaving = false,
}: VisualTemplateStudioProps) {
  const isEditing = !!template;
  const { mutate: sendTestEmail, isPending: isSendingTest } = useSendTestEmail();

  // Template identity
  const [name, setName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  // Visual Design configuration
  const [config, setConfig] = useState<EmailDesignConfig>(EMAIL_PRESETS.obsidian_gold.config);

  // Studio UI state
  const [activeTab, setActiveTab] = useState<string>("presets");
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [simulateVariables, setSimulateVariables] = useState<boolean>(true);
  const [showRawHtml, setShowRawHtml] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Test email sending dialog state
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState<boolean>(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState<string>("");

  // Rehydrate on load or switch
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name || "");
        setSubject(template.subject || "");
        
        // Attempt extraction of visual config from HTML comment or template property
        const extracted = template.designConfig || extractDesignConfigFromHtml(template.bodyHtml);
        if (extracted) {
          setConfig(extracted);
        } else {
          // Fallback to obsidian_gold with existing body content
          const fallback = JSON.parse(JSON.stringify(EMAIL_PRESETS.obsidian_gold.config)) as EmailDesignConfig;
          fallback.content.bodyHtml = template.bodyHtml || fallback.content.bodyHtml;
          fallback.content.subject = template.subject || fallback.content.subject;
          setConfig(fallback);
        }
      } else {
        // New template default
        setName("user_verification");
        setSubject("رمز التحقق الأمني من DUNAS TRAVEL • {{otpCode}}");
        setConfig(JSON.parse(JSON.stringify(EMAIL_PRESETS.obsidian_gold.config)));
      }
    }
  }, [open, template]);

  // Keep subject in sync with config.content.subject
  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setConfig((prev) => ({
      ...prev,
      content: { ...prev.content, subject: val },
    }));
  };

  // Switch preset
  const handleSelectPreset = (presetId: PresetId) => {
    const selected = EMAIL_PRESETS[presetId];
    if (!selected) return;

    setConfig((prev) => ({
      ...selected.config,
      content: {
        ...selected.config.content,
        greeting: prev.content.greeting || selected.config.content.greeting,
        bodyHtml: prev.content.bodyHtml || selected.config.content.bodyHtml,
        subject: subject || selected.config.content.subject,
      },
    }));
    toast.info(`تم تطبيق قالب "${selected.nameAr}" بنجاح ✨`);
  };

  // Compile HTML output
  const compiledHtml = useMemo(() => {
    return compileTemplateHtml(config);
  }, [config]);

  // Simulated HTML for live preview
  const previewHtml = useMemo(() => {
    if (simulateVariables) {
      return simulateTemplateWithVariables(compiledHtml);
    }
    return compiledHtml;
  }, [compiledHtml, simulateVariables]);

  // Insert variable tag into bodyHtml
  const insertVariable = (variableKey: string) => {
    setConfig((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        bodyHtml: `${prev.content.bodyHtml} ${variableKey}`,
      },
    }));
    toast.success(`تم إدراج المتغير ${variableKey}`);
  };

  // Handle Save
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم القالب");
      return;
    }
    if (!subject.trim()) {
      toast.error("يرجى إدخال عنوان الموضوع (Subject)");
      return;
    }

    // Extract used variables
    const foundVars = (compiledHtml.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || []).map((v) =>
      v.replace(/[{}]/g, "")
    );
    const uniqueVars = Array.from(new Set(foundVars));

    onSave({
      name: name.trim(),
      subject: subject.trim(),
      bodyHtml: compiledHtml,
      variables: uniqueVars,
    });
  };

  // Handle Send Test Email
  const handleSendTest = () => {
    if (!testRecipientEmail.trim() || !testRecipientEmail.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح لإرسال التجربة");
      return;
    }

    sendTestEmail(
      {
        recipientEmail: testRecipientEmail.trim(),
        subject: subject.trim() || "تجربة قالب البريد • DUNAS TRAVEL",
        bodyHtml: compiledHtml,
        sampleVariables: {
          name: "أحمد سعيد (مدير النظام)",
          otpCode: "941820",
          verifyUrl: "https://dunastravel.com/verify-email?token=test_token_8899",
          bookingRef: "DUNAS-TEST-VIP",
        },
      },
      {
        onSuccess: () => {
          setTestEmailDialogOpen(false);
        },
      }
    );
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledHtml);
    setCopiedHtml(true);
    toast.success("تم نسخ كود الـ HTML إلى الحافظة");
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[96vw] w-[1440px] h-[94vh] p-0 flex flex-col overflow-hidden bg-background border-border/70 rounded-2xl shadow-2xl"
      >
        {/* Studio Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold tracking-tight">
                  استوديو تصميم القوالب المرئي
                </DialogTitle>
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                  Visual Builder Pro
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                تحرير احترافي وتخصيص كامل بدون الحاجة لكتابة أكواد مع معاينة حية متزامنة
              </p>
            </div>
          </div>

          {/* Quick Preview & Action Controls */}
          <div className="flex items-center gap-3">
            {/* Simulation toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <Switch
                id="sim-vars"
                checked={simulateVariables}
                onCheckedChange={setSimulateVariables}
              />
              <Label htmlFor="sim-vars" className="text-xs cursor-pointer select-none font-medium">
                محاكاة البيانات الحقيقية
              </Label>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant={deviceView === "desktop" ? "secondary" : "ghost"}
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => setDeviceView("desktop")}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>سطح المكتب</span>
              </Button>
              <Button
                size="sm"
                variant={deviceView === "mobile" ? "secondary" : "ghost"}
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => setDeviceView("mobile")}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>الهاتف</span>
              </Button>
            </div>

            {/* Raw HTML Toggle */}
            <Button
              size="sm"
              variant={showRawHtml ? "default" : "outline"}
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowRawHtml(!showRawHtml)}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawHtml ? "عرض التصميم" : "كود HTML"}</span>
            </Button>

            {/* Test Send Trigger */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
              onClick={() => setTestEmailDialogOpen(true)}
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال بريد تجريبي</span>
            </Button>

            {/* Save Template Button */}
            <Button
              size="sm"
              variant="gold"
              className="h-8 text-xs gap-1.5 font-bold shadow-md shadow-amber-500/20"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "جارٍ الحفظ..." : isEditing ? "تحديث القالب" : "حفظ القالب الجديد"}</span>
            </Button>
          </div>
        </div>

        {/* Main Work Area: Left Controls & Right Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Editor Controls (Tabs) */}
          <div className="w-[520px] lg:w-[560px] border-e border-border flex flex-col bg-background/95 shrink-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 pt-3 border-b border-border/60 bg-muted/20">
                <TabsList className="w-full grid grid-cols-5 h-9 bg-background/80 border border-border/50 text-xs">
                  <TabsTrigger value="presets" className="text-[11px] gap-1 px-1">
                    <Layers className="w-3 h-3" />
                    <span>القوالب</span>
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="text-[11px] gap-1 px-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>الهوية</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-[11px] gap-1 px-1">
                    <FileText className="w-3 h-3" />
                    <span>المحتوى</span>
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="text-[11px] gap-1 px-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>الزر و OTP</span>
                  </TabsTrigger>
                  <TabsTrigger value="footer" className="text-[11px] gap-1 px-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>التذييل</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents: Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 1. PRESETS & PALETTE */}
                <TabsContent value="presets" className="m-0 space-y-5">
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-500" />
                      <span>اختر النمط والتصميم الجاهز (Presets)</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      انقر لاختيار تصميم متناسق ومصمم خصيصاً لهوية DUNAS TRAVEL الفاخرة
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(EMAIL_PRESETS).map((preset) => {
                        const isSelected = config.presetId === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20"
                                : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs">{preset.nameAr.split(" ")[0]}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: preset.config.theme.canvasBg }}
                                title="Canvas"
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: preset.config.theme.cardBg }}
                                title="Card"
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: preset.config.theme.accentColor }}
                                title="Accent"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {preset.nameAr}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fine-tune Color Palette */}
                  <div className="pt-4 border-t border-border/60">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      تخصيص لوحة الألوان يدوياً
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1.5 block">اللون المميز (Accent / Gold)</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.accentColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, accentColor: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                          />
                          <Input
                            value={config.theme.accentColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, accentColor: e.target.value },
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs mb-1.5 block">خلفية البطاقة (Card Background)</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.cardBg}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, cardBg: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                          />
                          <Input
                            value={config.theme.cardBg}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, cardBg: e.target.value },
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs mb-1.5 block">الخلفية الخارجية (Canvas)</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.canvasBg}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, canvasBg: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                          />
                          <Input
                            value={config.theme.canvasBg}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, canvasBg: e.target.value },
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs mb-1.5 block">لون النص (Text Color)</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.textColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, textColor: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                          />
                          <Input
                            value={config.theme.textColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                theme: { ...prev.theme, textColor: e.target.value },
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. BRANDING & HEADER */}
                <TabsContent value="branding" className="m-0 space-y-4">
                  <div>
                    <Label className="text-xs font-bold mb-1.5 block">
                      اسم القالب في النظام (Template Key / Name) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. user_verification"
                      className="font-mono text-xs"
                      disabled={isEditing}
                    />
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        قوالب المنصة الرسمية السريعة (انقر للتعيين):
                      </p>
                      <div className="space-y-1">
                        {STANDARD_PLATFORM_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.name}
                            type="button"
                            onClick={() => {
                              setName(tmpl.name);
                              if (tmpl.name === "user_verification") {
                                handleSubjectChange("رمز التحقق الأمني من DUNAS TRAVEL • {{otpCode}}");
                              } else if (tmpl.name === "booking_customer_confirmation") {
                                handleSubjectChange("تأكيد حجز رحلتك الحصرية مع DUNAS TRAVEL • {{bookingRef}}");
                              }
                            }}
                            className={`w-full text-start p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                              name === tmpl.name
                                ? "border-amber-500 bg-amber-500/10 font-bold text-amber-500"
                                : "border-border/60 hover:bg-muted/40"
                            }`}
                          >
                            <span>{tmpl.label}</span>
                            {name === tmpl.name && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subject line */}
                  <div className="pt-2">
                    <Label className="text-xs font-bold mb-1.5 block">
                      عنوان الرسالة (Email Subject) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      placeholder="e.g. رمز التحقق الخاص بك • {{otpCode}}"
                      className="text-xs font-medium"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="pt-2">
                    <Label className="text-xs mb-1.5 block">اسم العلامة التجارية (Company Name)</Label>
                    <Input
                      value={config.branding.companyName}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, companyName: e.target.value },
                        }))
                      }
                      className="text-xs"
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <Label className="text-xs mb-1.5 block">رابط اللوجو (Logo Image URL)</Label>
                    <Input
                      value={config.branding.logoUrl || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, logoUrl: e.target.value },
                        }))
                      }
                      placeholder="https://www.dunastravel.com/logo-gold.png"
                      className="text-xs font-mono"
                    />
                    <div className="flex gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, logoUrl: "https://www.dunastravel.com/logo-gold.png" },
                          }))
                        }
                      >
                        لوجو ذهبي أصلي
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, logoUrl: "" },
                          }))
                        }
                      >
                        نص فقط بدون صورة
                      </Button>
                    </div>
                  </div>

                  {/* Badge Text */}
                  <div>
                    <Label className="text-xs mb-1.5 block">الشعار الفرعي (Header Badge / Tagline)</Label>
                    <Input
                      value={config.branding.badgeText || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, badgeText: e.target.value },
                        }))
                      }
                      placeholder="BESPOKE JOURNEYS & LUXURY EXPERIENCES"
                      className="text-xs"
                    />
                  </div>

                  {/* Hero Banner Image */}
                  <div>
                    <Label className="text-xs mb-1.5 block">صورة الغلاف الرأسية (Hero Banner URL - اختياري)</Label>
                    <Input
                      value={config.branding.bannerUrl || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, bannerUrl: e.target.value },
                        }))
                      }
                      placeholder="https://images.unsplash.com/... (صورة رحلة فاخرة)"
                      className="text-xs font-mono"
                    />
                  </div>
                </TabsContent>

                {/* 3. CONTENT & VARIABLES */}
                <TabsContent value="content" className="m-0 space-y-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">التحية الترحيبية (Greeting)</Label>
                    <Input
                      value={config.content.greeting || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          content: { ...prev.content, greeting: e.target.value },
                        }))
                      }
                      placeholder="عزيزنا {{name}}،"
                      className="text-xs"
                    />
                  </div>

                  {/* Dynamic Variable Chips */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-muted-foreground font-semibold">
                      المتغيرات الديناميكية (انقر لإدراج المتغير داخل النص):
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertVariable(v.key)}
                          className="px-2 py-1 bg-muted/60 hover:bg-amber-500/20 hover:text-amber-400 border border-border/70 rounded-md text-[11px] font-mono transition-colors"
                          title="انقر للإدراج"
                        >
                          {v.key} <span className="text-[9px] text-muted-foreground font-sans">({v.label.split(" ")[0]})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Body Paragraphs */}
                  <div>
                    <Label className="text-xs mb-1.5 block">
                      نص ومحتوى البريد (Body HTML / Content)
                    </Label>
                    <Textarea
                      value={config.content.bodyHtml}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          content: { ...prev.content, bodyHtml: e.target.value },
                        }))
                      }
                      rows={9}
                      className="text-xs font-sans leading-relaxed"
                      placeholder="<p>مرحباً بك في DUNAS TRAVEL...</p>"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      يدعم فقرات الـ HTML البسيطة مثل &lt;p&gt; و &lt;strong&gt; و &lt;br&gt;.
                    </p>
                  </div>
                </TabsContent>

                {/* 4. ACTIONS: HIGHLIGHT BOX & CTA */}
                <TabsContent value="actions" className="m-0 space-y-6">
                  {/* Highlight Box (OTP / Code Box) */}
                  <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold">صندوق الإبراز الأمني (OTP / Passcode Box)</span>
                      </div>
                      <Switch
                        checked={config.highlightBox?.enabled ?? true}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            highlightBox: {
                              ...(prev.highlightBox || { type: "OTP_CODE", title: "", value: "{{otpCode}}" }),
                              enabled: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    {config.highlightBox?.enabled && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <Label className="text-xs mb-1 block">عنوان الصندوق</Label>
                          <Input
                            value={config.highlightBox.title || ""}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                highlightBox: { ...prev.highlightBox!, title: e.target.value },
                              }))
                            }
                            placeholder="Security Verification Code • رمز التحقق الأمني"
                            className="text-xs"
                          />
                        </div>

                        <div>
                          <Label className="text-xs mb-1 block">القيمة المعروضة (رمز OTP أو رقم مرجعي)</Label>
                          <Input
                            value={config.highlightBox.value || ""}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                highlightBox: { ...prev.highlightBox!, value: e.target.value },
                              }))
                            }
                            placeholder="{{otpCode}} أو {{bookingRef}}"
                            className="text-xs font-mono"
                          />
                        </div>

                        <div>
                          <Label className="text-xs mb-1 block">ملاحظة الصلاحية أو التنبيه</Label>
                          <Input
                            value={config.highlightBox.note || ""}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                highlightBox: { ...prev.highlightBox!, note: e.target.value },
                              }))
                            }
                            placeholder="⏱️ Valid for 15 minutes • صالح لمدة 15 دقيقة فقط"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold">زر التفاعل الرئيسي (Call-To-Action Button)</span>
                      </div>
                      <Switch
                        checked={config.ctaButton?.enabled ?? true}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            ctaButton: {
                              ...(prev.ctaButton || { text: "تأكيد", url: "{{verifyUrl}}", style: "GRADIENT" }),
                              enabled: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    {config.ctaButton?.enabled && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <Label className="text-xs mb-1 block">نص الزر</Label>
                          <Input
                            value={config.ctaButton.text || ""}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                ctaButton: { ...prev.ctaButton!, text: e.target.value },
                              }))
                            }
                            placeholder="Verify & Confirm Booking • تفعيل الحساب وتأكيد الحجز"
                            className="text-xs"
                          />
                        </div>

                        <div>
                          <Label className="text-xs mb-1 block">رابط الزر (Target URL)</Label>
                          <Input
                            value={config.ctaButton.url || ""}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                ctaButton: { ...prev.ctaButton!, url: e.target.value },
                              }))
                            }
                            placeholder="{{verifyUrl}}"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 5. FOOTER & LEGAL */}
                <TabsContent value="footer" className="m-0 space-y-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">عنوان المقر أو الدول (Address / Footnote)</Label>
                    <Input
                      value={config.footer.address || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, address: e.target.value },
                        }))
                      }
                      placeholder="المقر الرئيسي — القاهرة • إسبانيا • إيطاليا • البرازيل • المكسيك"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5 block">بريد الدعم والاتصال (Support Email)</Label>
                    <Input
                      value={config.footer.contactEmail || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, contactEmail: e.target.value },
                        }))
                      }
                      placeholder="concierge@dunastravel.com"
                      className="text-xs font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5 block">تنبيه الأمان (Security Notice)</Label>
                    <Textarea
                      value={config.footer.securityNotice || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, securityNotice: e.target.value },
                        }))
                      }
                      rows={3}
                      className="text-xs"
                      placeholder="لا تشارك رمز التحقق أو كلمة المرور مع أي شخص..."
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Column: Interactive Sandboxed Live Preview */}
          <div className="flex-1 flex flex-col bg-zinc-950/90 overflow-hidden relative">
            {/* Preview Toolbar */}
            <div className="px-6 py-2.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[11px] bg-zinc-800/80 text-zinc-300 border-zinc-700">
                  {deviceView === "desktop" ? "عرض شاشة سطح المكتب (600px)" : "عرض الهاتف المحمول (375px)"}
                </Badge>
                <span className="truncate max-w-[340px] text-zinc-300 font-medium">
                  {simulateVariables ? simulateTemplateWithVariables(subject) : subject || "بدون عنوان موضوع"}
                </span>
              </div>

              {showRawHtml && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-zinc-300 hover:text-white"
                  onClick={handleCopyHtml}
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? "تم النسخ" : "نسخ الكود"}</span>
                </Button>
              )}
            </div>

            {/* Canvas Viewport */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
              {showRawHtml ? (
                <div className="w-full max-w-4xl h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-auto">
                  <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {compiledHtml}
                  </pre>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border ${
                    deviceView === "desktop"
                      ? "w-full max-w-[640px] border-zinc-800"
                      : "w-[380px] border-zinc-700 ring-8 ring-zinc-800 rounded-[32px] my-2"
                  }`}
                  style={{ backgroundColor: config.theme.canvasBg }}
                >
                  <iframe
                    title="Live Email Preview"
                    srcDoc={previewHtml}
                    className="w-full border-none block"
                    style={{
                      height: deviceView === "desktop" ? "780px" : "640px",
                    }}
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Test Email Dialog */}
        <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
          <DialogContent className="sm:max-w-[460px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-500" />
                <span>إرسال بريد تجريبي مباشر</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                سيقوم النظام بتجميع القالب مع بيانات تجريبية حقيقية وإرساله عبر خادم البريد المعتمد إلى صندوقك فوراً للتأكد من المظهر وسلوك القراءة.
              </p>
              <div>
                <Label className="text-xs mb-1.5 block">البريد الإلكتروني المستلم</Label>
                <Input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="admin@example.com أو بريدك الشخصي"
                  className="text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestEmailDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="gold"
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? "جارٍ الإرسال..." : "إرسال الآن"}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
