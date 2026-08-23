"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { RecentActivityItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ArrowUpRight, ShieldCheck, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/config/admin-routes";

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");

  if (isLoading || !activities) {
    return (
      <Card className="shadow-xs border border-border/80 rounded-2xl bg-card p-6">
        <div className="h-5 w-48 bg-muted rounded-md mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return ts;
    }
  };

  return (
    <Card className="shadow-xs border border-border/80 rounded-2xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 sm:px-6 pt-5">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <Activity className="w-4 h-4 text-indigo-500 stroke-[2.2]" /> 
            {t("systemActivity")}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("systemActivitySubtitle")}
          </p>
        </div>

        <Link href={adminRoutes.audit}>
          <Button variant="outline" size="sm" className="text-xs font-bold border-border hover:border-amber-500/40 gap-1">
            <span>{isAr ? "سجل التدقيق" : "Full Audit"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-5">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-medium">
            {t("noRecentActivity")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((act) => {
              const isBooking = act.type === "BOOKING";
              const actionLabel = isAr ? (act.actionAr || act.action) : act.action;

              return (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs flex justify-between items-start gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
                      isBooking 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                    }`}>
                      {isBooking ? (
                        <CalendarCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-foreground">{act.actor}</span>
                        <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${
                          isBooking
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                        }`}>
                          {act.type}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground">{actionLabel}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{act.entity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 font-mono whitespace-nowrap">
                    <Clock className="w-3 h-3 text-muted-foreground/60" />
                    <span>{formatTimestamp(act.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
