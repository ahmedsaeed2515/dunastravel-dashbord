"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionAlert } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ActionCenterProps {
  alerts?: ActionAlert[];
  isLoading?: boolean;
}

export function ActionCenter({ alerts, isLoading }: ActionCenterProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  if (isLoading) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4 animate-spin" /> {isAr ? "جاري تحميل مركز العمليات والتنبيهات..." : "Operational Action Center Loading..."}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">
                {isAr ? "مركز العمليات — جميع الأنظمة مستقرة" : "Operational Action Center — All Systems Clear"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAr ? "لا توجد حجوزات معلقة أو استفسارات بدون رد أو تنبيهات سعة حرجة في الوقت الحالي." : "No urgent booking reviews, unanswered inquiries, or capacity warnings pending."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLocalizedTitle = (title: string) => {
    if (!isAr) return title;
    if (title.includes("Pending Bookings")) return "حجوزات جديدة بانتظار المراجعة والتأكيد";
    if (title.includes("Unanswered Customer")) return "استفسارات عملاء لم يتم الرد عليها";
    if (title.includes("Confirmed Bookings Unpaid")) return "حجوزات مؤكدة بدون دفعات مسجلة";
    if (title.includes("Departures Almost Fully")) return "رحلات قريبة أوشكت على الاكتمال";
    if (title.includes("Notification Delivery")) return "فشل إرسال بعض الإشعارات الإلكترونية";
    return title;
  };

  const getLocalizedReason = (reason: string) => {
    if (!isAr) return reason;
    if (reason.includes("new customer booking")) return `${reason.split(" ")[0]} حجز جديد بانتظار موافقة الإدارة وتأكيد المقاعد.`;
    if (reason.includes("tailor-made trip inquiry")) return `${reason.split(" ")[0]} طلب رحلة خاصة بانتظار الرد والتسعير.`;
    if (reason.includes("confirmed booking(s) have zero")) return `${reason.split(" ")[0]} حجز مؤكد لم يتم تسجيل أي دفعة مالية له حتى الآن.`;
    if (reason.includes("upcoming departure(s)")) return `${reason.split(" ")[0]} رحلة قادمة يتبقى بها 5 مقاعد أو أقل.`;
    if (reason.includes("failed to deliver")) return `${reason.split(" ")[0]} إشعار بريد أو نظام فشل في التسليم للعميل.`;
    return reason;
  };

  return (
    <Card className="border-amber-500/30 bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-amber-500/10 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4" /> 
          {isAr 
            ? `مركز التنبيهات والعمليات العاجلة (${alerts.length} إجراءات مطلوبة)`
            : `Operational Action Center (${alerts.length} Action Items Required)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 divide-y">
        {alerts.map((alert) => (
          <div key={alert.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{getLocalizedTitle(alert.title)}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {alert.count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{getLocalizedReason(alert.reason)}</p>
            </div>

            <Link href={`/${locale}${alert.actionLink}`}>
              <Button size="xs" variant="outline" className="gap-1 text-xs shrink-0 hover:bg-amber-500 hover:text-white">
                {isAr ? "متابعة" : "Action"} {isAr ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
