"use client";

import { useParams } from "next/navigation";
import { RecentActivityItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">{isAr ? "جاري تحميل سجل النشاطات..." : "Audit Log Feed Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const activityList = activities ?? [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> {isAr ? "سجل النشاطات وعمليات التدقيق" : "System Audit & Activity Feed"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 sm:p-6">
        {activityList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">{isAr ? "لا توجد نشاطات مسجلة حديثاً." : "No recent audit log entries recorded."}</div>
        ) : (
          <div className="space-y-3">
            {activityList.map((act) => {
              const displayAction = (isAr && act.actionAr) ? act.actionAr : act.action;
              return (
                <div key={act.id} className="p-3 rounded-xl border border-border/80 bg-muted/30 hover:border-amber-500/30 transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{act.actor}</span>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-background border border-border/60 shrink-0">
                        {act.type}
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      <span className="font-semibold text-foreground">{displayAction}</span> {isAr ? "على" : "on"} <span className="font-mono text-primary font-bold">{act.entity}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0 self-end sm:self-center bg-background/50 px-2 py-1 rounded-lg border border-border/40">
                    <Clock className="w-3 h-3 text-amber-500" /> {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
