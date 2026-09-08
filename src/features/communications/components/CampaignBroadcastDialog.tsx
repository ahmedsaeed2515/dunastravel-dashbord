"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Megaphone, 
  Users, 
  ShieldCheck, 
  Send, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ListPlus
} from "lucide-react";
import { toast } from "sonner";
import { 
  BroadcastAudienceType, 
  EmailTemplate 
} from "../types";
import { useBroadcastCampaign } from "../hooks/useCommunications";

interface CampaignBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates?: EmailTemplate[];
}

export function CampaignBroadcastDialog({
  open,
  onOpenChange,
  templates = [],
}: CampaignBroadcastDialogProps) {
  const { mutate: broadcastCampaign, isPending: isSending } = useBroadcastCampaign();

  const [audience, setAudience] = useState<BroadcastAudienceType>("VERIFIED_CUSTOMERS");
  const [customEmails, setCustomEmails] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [bodyHtml, setBodyHtml] = useState<string>("");
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    campaignId: string;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
  } | null>(null);

  // When selecting a template from existing ones
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBodyHtml(tmpl.bodyHtml);
    }
  };

  const handleNext = () => {
    if (!subject.trim()) {
      toast.error("يرجى إدخال عنوان موضوع الحملة");
      return;
    }
    if (!bodyHtml.trim()) {
      toast.error("يرجى إدخال محتوى الرسالة أو اختيار قالب مسبق");
      return;
    }
    if (audience === "CUSTOM_LIST" && !customEmails.trim()) {
      toast.error("يرجى إدخال عناوين البريد المخصصة مفصولة بفواصل أو أسطر جديدة");
      return;
    }
    setIsConfirmStep(true);
  };

  const handleSend = () => {
    const customList = audience === "CUSTOM_LIST"
      ? customEmails
          .split(/[\n,;]+/)
          .map((e) => e.trim())
          .filter((e) => e && e.includes("@"))
      : undefined;

    broadcastCampaign(
      {
        recipientGroup: audience,
        subject: subject.trim(),
        bodyHtml: bodyHtml.trim(),
        templateId: selectedTemplateId || undefined,
        customEmails: customList,
      },
      {
        onSuccess: (data) => {
          setBroadcastResult(data);
          setIsConfirmStep(false);
        },
      }
    );
  };

  const handleResetAndClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsConfirmStep(false);
      setBroadcastResult(null);
      setSubject("");
      setBodyHtml("");
      setCustomEmails("");
      setSelectedTemplateId("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[650px] rounded-2xl p-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                إرسال حملة بريدية جماعية (Email Campaign Broadcast)
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                إرسال إشعارات وعروض خاصة لشرائح العملاء المسجلين دفعة واحدة
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {broadcastResult ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-in zoom-in-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">تم إرسال الحملة البريدية بنجاح!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                تمت معالجة الحملة وتسجيل العمليات في سجلات الاتصال الرسمية.
              </p>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border max-w-md mx-auto text-center">
                <div>
                  <div className="text-xs text-muted-foreground">المستهدفين</div>
                  <div className="text-base font-bold">{broadcastResult.totalRecipients}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">تم الإرسال</div>
                  <div className="text-base font-bold text-emerald-500">{broadcastResult.sentCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">فشل</div>
                  <div className="text-base font-bold text-destructive">{broadcastResult.failedCount}</div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="default" onClick={handleResetAndClose}>
                  إغلاق النافذة
                </Button>
              </div>
            </div>
          ) : isConfirmStep ? (
            /* Confirmation Step */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold block">تأكيد نهائي قبل إرسال الحملة الحية:</span>
                  <p className="leading-relaxed opacity-90">
                    سيتم إرسال رسائل بريد إلكتروني حقيقية لجميع العملاء المنتمين للشريحة المحددة. يرجى مراجعة التفاصيل أدناه للتأكد من المحتوى والمستهدفين.
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border p-4 bg-card/50 text-xs">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">الشريحة المستهدفة:</span>
                  <Badge variant="outline" className="font-bold">
                    {audience === "ALL_USERS" && "جميع المستخدمين المسجلين"}
                    {audience === "VERIFIED_CUSTOMERS" && "العملاء المؤكدة حساباتهم فقط"}
                    {audience === "MARKETING_OPT_IN" && "المشتركون في النشرة الإخبارية"}
                    {audience === "CUSTOM_LIST" && "قائمة بريدية مخصصة"}
                  </Badge>
                </div>

                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">عنوان الرسالة:</span>
                  <span className="font-bold text-foreground">{subject}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-1">معاينة المحتوى:</span>
                  <div className="p-3 bg-muted/40 rounded-lg text-xs max-h-36 overflow-y-auto leading-relaxed border">
                    {bodyHtml.replace(/<[^>]*>?/gm, "").substring(0, 300)}...
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirmStep(false)}
                  disabled={isSending}
                >
                  الرجوع للتعديل
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="gold"
                  onClick={handleSend}
                  disabled={isSending}
                  className="gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "جارٍ إرسال الحملة..." : "تأكيد وبدء الإرسال الفوري"}</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Compose Step */
            <div className="space-y-5">
              {/* Audience Selection */}
              <div>
                <Label className="text-xs font-bold mb-2 block">
                  1. اختر الشريحة المستهدفة (Target Audience)
                </Label>
                <RadioGroup
                  value={audience}
                  onValueChange={(val) => setAudience(val as BroadcastAudienceType)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2.5"
                >
                  <label
                    htmlFor="aud_verified"
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      audience === "VERIFIED_CUSTOMERS"
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="VERIFIED_CUSTOMERS" id="aud_verified" className="mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>العملاء المؤكدة حساباتهم (موصى به)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        المستخدمون الذين أتموا تفعيل بريدهم برمز الـ OTP
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="aud_all"
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      audience === "ALL_USERS"
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="ALL_USERS" id="aud_all" className="mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>كافة المسجلين بالنظام</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        جميع الحسابات الموجودة بقاعدة البيانات
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="aud_marketing"
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      audience === "MARKETING_OPT_IN"
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="MARKETING_OPT_IN" id="aud_marketing" className="mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>قائمة النشرة الإخبارية</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        العملاء المشتركون في العروض الترويجية
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="aud_custom"
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      audience === "CUSTOM_LIST"
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="CUSTOM_LIST" id="aud_custom" className="mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <ListPlus className="w-3.5 h-3.5 text-emerald-500" />
                        <span>قائمة بريدية مخصصة</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        إدخال عناوين محددة يدوياً
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Custom emails input if selected */}
              {audience === "CUSTOM_LIST" && (
                <div className="animate-in fade-in-50">
                  <Label className="text-xs font-bold mb-1.5 block">
                    عناوين البريد المخصصة (مفصولة بأسطر جديدة أو فواصل)
                  </Label>
                  <Textarea
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    rows={3}
                    placeholder="vip.client@domain.com, investor@dunas.com"
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* Template picker shortcut */}
              {templates.length > 0 && (
                <div>
                  <Label className="text-xs font-bold mb-1.5 block">
                    2. اختر قالباً محفوظاً (اختياري)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tmpl) => (
                      <Button
                        key={tmpl.id}
                        type="button"
                        variant={selectedTemplateId === tmpl.id ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={() => handleTemplateSelect(tmpl.id)}
                      >
                        <Mail className="w-3 h-3" />
                        <span>{tmpl.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <Label className="text-xs font-bold mb-1.5 block">
                  3. عنوان الرسالة (Subject) <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. عروض الموسم الحصرية لرحلات النيل والصحراء الكبرى ✨"
                  className="text-xs"
                />
              </div>

              {/* Body */}
              <div>
                <Label className="text-xs font-bold mb-1.5 block">
                  4. نص الرسالة (Message Content / HTML) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={6}
                  placeholder="<p>عزيزنا المسافر، يسر شركة ديوناز ترافيل دعوتكم...</p>"
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAndClose}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="gold"
                  onClick={handleNext}
                  className="gap-1.5"
                >
                  <span>مراجعة المستهدفين والتأكيد</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
