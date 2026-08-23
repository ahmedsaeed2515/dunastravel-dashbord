"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ActionAlert } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Sparkles
} from "lucide-react";

interface ActionCenterProps {
  alerts?: ActionAlert[];
  isLoading?: boolean;
}

export function ActionCenter({ alerts, isLoading }: ActionCenterProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");

  if (isLoading) {
    return (
      <Card className="border border-border/80 bg-card p-4 rounded-2xl animate-pulse">
        <div className="h-5 w-48 bg-muted rounded-md mb-2" />
        <div className="h-4 w-72 bg-muted/60 rounded-md" />
      </Card>
    );
  }

  // Filter out any zero count alerts
  const activeAlerts = (alerts || []).filter((a) => a.count > 0);

  if (activeAlerts.length === 0) {
    return (
      <Card className="border border-emerald-500/25 bg-emerald-500/5 shadow-xs rounded-2xl">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">
                {t("allSystemsClear")}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "لا توجد حجوزات معلقة تتطلب تدخلاً عاجلاً أو استفسارات متأخرة عن الرد."
                  : "No overdue inquiries, low-capacity departures, or unconfirmed bookings pending."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          cardBg: "bg-rose-500/5 border-rose-500/30",
          badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          iconColor: "text-rose-500",
          Icon: AlertCircle,
        };
      case "medium":
      case "warning":
        return {
          cardBg: "bg-amber-500/5 border-amber-500/30",
          badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          iconColor: "text-amber-500",
          Icon: AlertTriangle,
        };
      default:
        return {
          cardBg: "bg-blue-500/5 border-blue-500/30",
          badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
          iconColor: "text-blue-500",
          Icon: Sparkles,
        };
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wide">
            {t("actionCenterRequired")} ({activeAlerts.length})
          </h2>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {activeAlerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          const Icon = style.Icon;

          // Resolve clean internal route
          let cleanHref = alert.actionLink;
          if (cleanHref.startsWith('/en') || cleanHref.startsWith('/ar')) {
            cleanHref = cleanHref.replace(/^\/(en|ar|es|pt|it)/, '');
          }

          return (
            <Link
              key={alert.id}
              href={cleanHref as any}
              className={`p-3.5 rounded-xl border ${style.cardBg} flex items-center justify-between gap-3 hover:shadow-md hover:scale-[1.01] transition-all duration-150 group bg-card`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-card border border-border shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${style.iconColor} stroke-[2.2]`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
                      {alert.title}
                    </span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.2 rounded-full border ${style.badge}`}>
                      {alert.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {alert.reason}
                  </p>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-muted/60 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                <ArrowIcon className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
