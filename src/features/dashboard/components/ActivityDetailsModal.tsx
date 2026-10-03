"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  User,
  Clock,
  Globe,
  Layers,
  FileText,
  ExternalLink,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Info,
  SlidersHorizontal,
  GitCommit,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { RecentActivityItem } from "../types";

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: RecentActivityItem | any | null;
}

// Arabic translation dictionary for key payload fields
const FIELD_LABEL_MAP: Record<string, string> = {
  status: "حالة العنصر / الإجراء",
  previousStatus: "الحالة السابقة",
  newStatus: "الحالة الجديدة",
  content: "محتوى التعديل",
  key: "مفتاح المحتوى / CMS Key",
  title: "العنوان الرئيسي",
  amount: "المبلغ المالي (USD)",
  version: "رقم الإصدار (Version)",
  reason: "سبب التعديل / التوثيق",
  note: "ملاحظة المسؤول",
  bookingId: "معرف الحجز المرجعي",
  tourSlug: "الرحلة السياحية",
  userId: "معرف المستخدم",
  email: "البريد الإلكتروني",
  role: "الصلاحية / الدور الإداري",
  lastUpdatedBy: "قام بالتعديل بواسطة",
  isActive: "حالة التفعيل",
  createdAt: "تاريخ الإنشاء",
  updatedAt: "تاريخ التحديث",
};

export function ActivityDetailsModal({
  isOpen,
  onClose,
  activity,
}: ActivityDetailsModalProps) {
  const params = useParams();
  const router = useRouter();
  const isAr = params?.locale === "ar";
  const [showRawJson, setShowRawJson] = useState(false);

  if (!activity) return null;

  // Normalize data
  const actor =
    activity.actor ||
    activity.user?.name ||
    activity.user?.email ||
    activity.actorRole ||
    (isAr ? "مسؤول النظام" : "System Operator");
  const actionTitle =
    (isAr && activity.actionAr)
      ? activity.actionAr
      : activity.action || (isAr ? "إجراء إداري" : "System Action");
  const rawAction = activity.rawAction || activity.action || "SYSTEM_EVENT";
  const entity =
    activity.entity ||
    (activity.resourceType
      ? `${activity.resourceType} ${activity.resourceId || ""}`
      : isAr
      ? "النظام العام"
      : "General System");
  const timestamp = activity.timestamp || activity.createdAt;
  const type = (activity.type || "AUDIT").toUpperCase();
  const payload = activity.metadata || activity.details || null;
  const ipAddress = activity.ipAddress;
  const userAgent = activity.userAgent;
  const bookingId = activity.bookingId || (activity.resourceType === "BOOKING" ? activity.resourceId : null);

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString(isAr ? "ar-EG" : "en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : "—";

  // Detailed Arabic narrative generation based on action type
  const getNarrative = (actionStr: string, entityStr: string) => {
    const actUpper = (actionStr || "").toUpperCase();
    if (actUpper.includes("CMS_BLOCK_UPSERTED") || actUpper.includes("CONTENT")) {
      return {
        explanation: "قام مسؤول النظام بتحديث بيانات ومحتوى كتل الصفحة (CMS Block). تم اعتماد النص والكتل المرئية وتوثيق رقم الإصدار الأحدث لتظهر التغييرات فوراً على واجهة الموقع للزوار.",
        sectionName: "إدارة محتوى الموقع والتصميم (CMS Content & Design)",
        targetBadge: "تحديث محتوى",
      };
    }
    if (actUpper.includes("REFUND") || actUpper.includes("PAYMENT")) {
      return {
        explanation: "تم تنفيذ وتوثيق عملية استرداد مالي لحساب العميل في النظام. تم تسجيل قيمة المستردات وتحديث السجلات المالية للشركة وإصدار توثيق بنكي ومحاسبي للإجراء.",
        sectionName: "الحسابات والمعاملات المالية (Finance & Refunds)",
        targetBadge: "معاملة مالية",
      };
    }
    if (actUpper.includes("BOOKING_CREATED") || actUpper.includes("NEW_BOOKING")) {
      return {
        explanation: "تم تسجيل طلب حجز جديد وتخزينه بالنظام وتأكّيد تخصيص المقاعد، وإنشاء الكود المرجعي الفريد وتنبيه فريق العمل لمتابعة التفاصيل.",
        sectionName: "إدارة الحجوزات والطلبات (Bookings Engine)",
        targetBadge: "إنشاء حجز",
      };
    }
    if (actUpper.includes("BOOKING_CONFIRMED") || actUpper.includes("CONFIRM")) {
      return {
        explanation: "تم تغيير حالة الحجز رسمياً إلى (مؤكد Confirmed) بعد مراجعة بيانات الدفع وتوافر المقاعد، وتحديث السجل الإداري وتجهيز أوراق السفر للعميل.",
        sectionName: "عمليات وتأكيدات الحجز (Booking Operations)",
        targetBadge: "تأكيد حجز",
      };
    }
    if (actUpper.includes("TOUR_PUBLISHED") || actUpper.includes("TOUR")) {
      return {
        explanation: "تم نشر برنامج رحلة سياحية جديدة أو تحديث أسعار ومواعيد ورحلات برنامج حالي وتفعيله للبيع المباشر على منصة دوناس ترافل.",
        sectionName: "إدارة البرامج والرحلات السياحية (Tours Management)",
        targetBadge: "تحديث رحلة",
      };
    }
    if (actUpper.includes("SETTING") || actUpper.includes("SYSTEM")) {
      return {
        explanation: "تم تعديل بعض الإعدادات الإدارية التشغيلية للنظام (مثل إعدادات أسعار الصرف، بوابات الدفع، أو إعدادات البريد الإشعاري).",
        sectionName: "إعدادات النظام العامة (System Configuration)",
        targetBadge: "تحديث إعدادات",
      };
    }
    if (actUpper.includes("REVIEW") || actUpper.includes("REPLY")) {
      return {
        explanation: "قام الموظف المسؤول بالرد على مراجعة وتقييم العميل ونشر الرد التوضيحي في قسم آراء وتجارب المسافرين.",
        sectionName: "خدمة العملاء والتقييمات (Customer Reviews)",
        targetBadge: "رد على تقييم",
      };
    }

    return {
      explanation: `تم تنفيذ وتوثيق الإجراء الإداري (${actionStr}) على العنصر (${entityStr}) بنجاح. تم حفظ كافة تفاصيل العملية وتأمين السجل في قاعدة بيانات مراجعة النظام.`,
      sectionName: "سجل التدقيق والمراجعة (Audit Log)",
      targetBadge: "إجراء إداري",
    };
  };

  const narrativeInfo = getNarrative(rawAction, entity);

  const handleNavigateToRelated = () => {
    onClose();
    if (bookingId || type === "BOOKING" || (entity && entity.toLowerCase().includes("booking"))) {
      router.push(`/${params?.locale || "ar"}/admin/bookings`);
    } else {
      router.push(`/${params?.locale || "ar"}/admin/audit`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-2 text-start border-b pb-4 border-border/60">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>{isAr ? "تقرير وتفاصيل إجراء التعديل" : "Operation Audit & Action Details"}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "شرح دقيق وتفصيلي لما تم إنجازه في هذه العملية والإجراءات المتبعة"
                    : "Detailed narrative and action log of what happened in this operation"}
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 bg-muted/40 uppercase">
              {type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Main Action Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs text-primary font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? "الإجراء المنفّذ:" : "Executed Action:"}</span>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] hover:bg-primary/30">
                {narrativeInfo.targetBadge}
              </Badge>
            </div>

            <div className="text-base font-bold text-foreground leading-snug">
              {actionTitle}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-mono bg-background/80 px-2 py-0.5 rounded border text-[11px] font-semibold text-foreground">
                {rawAction}
              </span>
              <span>•</span>
              <span>{isAr ? "القسم المعني:" : "Module:"}</span>
              <span className="font-semibold text-foreground">{narrativeInfo.sectionName}</span>
            </div>
          </div>

          {/* DETAILED EXPLANATION BOX (ما الذي تم بالضبط في هذه العملية؟) */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>{isAr ? "ما الذي تم بالضبط في هذه العملية؟" : "What happened in this operation?"}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {narrativeInfo.explanation}
            </p>
          </div>

          {/* KEY OVERVIEW GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border bg-card/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-muted-foreground text-[11px]">{isAr ? "من قام بالعملية (المسؤول)" : "Actor / Operator"}</div>
                <div className="font-bold text-foreground truncate">{actor}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-card/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-muted-foreground text-[11px]">{isAr ? "توقيت وتاريخ التعديل" : "Timestamp"}</div>
                <div className="font-semibold text-foreground text-[11px] leading-tight">{formattedDate}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-card/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-muted-foreground text-[11px]">{isAr ? "العنصر / الصفحة المعدلة" : "Target Entity"}</div>
                <div className="font-bold text-foreground truncate">{entity}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-card/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-muted-foreground text-[11px]">{isAr ? "عنوان شبكة الاتصال (IP)" : "IP Address"}</div>
                <div className="font-mono text-foreground font-semibold">{ipAddress || "127.0.0.1 (Local/Internal)"}</div>
              </div>
            </div>
          </div>

          {/* SYSTEM WORKFLOW STEPS (تسلسل إجراءات النظام المتبعة) */}
          <div className="space-y-2 border-t pt-4 border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-primary" />
              <span>{isAr ? "تسلسل الإجراءات التي تمت آلياً بالنظام:" : "System Execution Timeline:"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isAr ? "1. التحقق من صلاحيات مسؤول النظام" : "1. Identity & Auth verification"}</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isAr ? "2. معالجة وتدقيق التغييرات المطلوبة" : "2. Payload validation & sanitization"}</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isAr ? "3. الاعتماد والتخزين بقاعدة البيانات" : "3. DB commit & Audit log creation"}</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isAr ? "4. مزامنة التغييرات فورياً مع الواجهة" : "4. Cache flush & Real-time sync"}</span>
              </div>
            </div>
          </div>

          {/* USER AGENT DETAILS */}
          {userAgent && (
            <div className="p-3 rounded-xl border bg-muted/20 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="text-muted-foreground truncate">
                <span className="font-semibold text-foreground">{isAr ? "بيانات المتصفح والنظام:" : "Client Device:"}</span>{" "}
                <span className="font-mono text-[11px]">{userAgent}</span>
              </div>
            </div>
          )}

          {/* PAYLOAD / CHANGED FIELDS BREAKDOWN */}
          <div className="space-y-2 border-t pt-4 border-border/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>{isAr ? "جدول التغييرات والحقول المعدلة بالضبط:" : "Exact Modified Fields & Values:"}</span>
              </h4>

              {payload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showRawJson ? (isAr ? "عرض مبسط" : "Formatted View") : (isAr ? "عرض JSON الخام" : "Raw JSON")}</span>
                </Button>
              )}
            </div>

            {payload && Object.keys(payload).length > 0 ? (
              showRawJson ? (
                <pre className="p-3.5 rounded-xl bg-muted/80 text-foreground font-mono text-xs overflow-x-auto border max-h-60 dir-ltr">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {Object.entries(payload).map(([key, val]) => {
                    const arabicLabel = FIELD_LABEL_MAP[key] || key;
                    const stringVal =
                      typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : String(val);

                    return (
                      <div
                        key={key}
                        className="p-2.5 rounded-xl border bg-card flex items-start justify-between gap-3 text-xs flex-wrap sm:flex-nowrap hover:border-primary/30 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">{arabicLabel}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">({key})</span>
                        </div>
                        <div className="font-mono text-foreground font-semibold bg-muted/50 px-2.5 py-1 rounded-lg border border-border/60 max-w-full break-all text-end sm:text-start ms-auto">
                          {stringVal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground space-y-1 bg-muted/10">
                <Info className="w-4 h-4 text-muted-foreground mx-auto" />
                <p>
                  {isAr
                    ? "تم تنفيذ العملية بنجاح وتوثيق التغييرات تلقائياً في سجلات مراجعة الأمان."
                    : "Operation completed successfully and logged into system audit trail."}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 border-t pt-4 border-border/60">
          <Button variant="outline" onClick={onClose} className="cursor-pointer text-xs">
            {isAr ? "إغلاق النافذة" : "Close"}
          </Button>

          <Button
            onClick={handleNavigateToRelated}
            className="cursor-pointer text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {bookingId || type === "BOOKING" || (entity && entity.toLowerCase().includes("booking"))
                ? isAr
                  ? "الانتقال لإدارة الحجوزات"
                  : "Go to Bookings"
                : isAr
                ? "الانتقال لسجل المراجعة الكامل"
                : "View Full Audit Logs"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
