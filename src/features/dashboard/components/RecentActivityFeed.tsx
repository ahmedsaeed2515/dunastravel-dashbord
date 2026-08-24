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

  if (isLoading || !activities) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{isAr ? "جاري تحميل سجل النشاطات..." : "Audit Log Feed Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> {isAr ? "سجل النشاطات وعمليات التدقيق" : "System Audit & Activity Feed"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">{isAr ? "لا توجد نشاطات مسجلة حديثاً." : "No recent audit log entries recorded."}</div>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => {
              const displayAction = (isAr && act.actionAr) ? act.actionAr : act.action;
              return (
                <div key={act.id} className="p-3 rounded-lg border bg-muted/40 text-xs flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{act.actor}</span>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-background border">
                        {act.type}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{displayAction}</span> {isAr ? "على" : "on"} <span className="font-mono text-primary">{act.entity}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
