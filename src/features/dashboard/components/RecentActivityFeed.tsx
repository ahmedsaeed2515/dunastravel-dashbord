"use client";

import { RecentActivityItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

import { useParams } from "next/navigation";

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  if (isLoading || !activities) {
    return (
      <Card className="shadow-xs border border-border/80 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">{isAr ? "جاري تحميل سجل النشاطات..." : "Audit Log Feed Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-xs border border-border/80 rounded-2xl bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <Activity className="w-4 h-4 text-purple-500" /> 
          {isAr ? "سجل النشاط والتدقيق الأمني" : "System Audit & Activity Feed"}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAr ? "آخر الإجراءات المنفذة في النظام" : "Latest executed actions & security audit"}
        </p>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-medium">
            {isAr ? "لا توجد سجلات نشاط مسجلة مؤخراً." : "No recent audit log entries recorded."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{act.actor}</span>
                    <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                      {act.type}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed">
                    <span className="font-bold text-foreground">{act.action}</span> {isAr ? "على" : "on"} <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{act.entity}</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground/70" /> {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
