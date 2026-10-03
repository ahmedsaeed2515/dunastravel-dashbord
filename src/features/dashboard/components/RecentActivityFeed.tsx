import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RecentActivityItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ChevronRight, Eye } from "lucide-react";
import { ActivityDetailsModal } from "./ActivityDetailsModal";
import { Button } from "@/components/ui/button";

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

const getTypeColorClass = (type: string) => {
  const upper = (type || "").toUpperCase();
  if (upper.includes("CREATE") || upper.includes("NEW") || upper.includes("ADD")) {
    return {
      border: "border-s-4 border-s-emerald-500",
      bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("CANCEL")) {
    return {
      border: "border-s-4 border-s-red-500",
      bg: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
    };
  }
  if (upper.includes("UPDATE") || upper.includes("EDIT") || upper.includes("CHANGE")) {
    return {
      border: "border-s-4 border-s-blue-500",
      bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    };
  }
  if (upper.includes("AUTH") || upper.includes("LOGIN") || upper.includes("SECURITY")) {
    return {
      border: "border-s-4 border-s-amber-500",
      bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    };
  }
  return {
    border: "border-s-4 border-s-primary",
    bg: "bg-primary/10 text-primary border-primary/30",
  };
};

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  const params = useParams();
  const router = useRouter();
  const isAr = params?.locale === "ar";
  const [selectedActivity, setSelectedActivity] = useState<RecentActivityItem | null>(null);

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
    <>
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary shrink-0" />
              <span>{isAr ? "سجل النشاطات وعمليات التدقيق" : "System Audit & Activity Feed"}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${params?.locale || "ar"}/admin/audit`)}
              className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 px-2 cursor-pointer"
            >
              <span>{isAr ? "عرض الكل" : "View All"}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAr ? "تتبع فوري لأحدث العمليات وتغييرات النظام (اضغط على أي كارت للتفاصيل)" : "Real-time audit log (click any card for details)"}
          </p>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-2 sm:pt-2">
          {activityList.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">{isAr ? "لا توجد نشاطات مسجلة حديثاً." : "No recent audit log entries recorded."}</div>
          ) : (
            <div className="space-y-2.5">
              {activityList.map((act) => {
                const displayAction = (isAr && act.actionAr) ? act.actionAr : act.action;
                const styles = getTypeColorClass(act.type);

                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className={`p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 text-xs space-y-2 cursor-pointer group relative ${styles.border}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">{act.actor}</span>
                        <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border shrink-0 ${styles.bg}`}>
                          {act.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ms-auto sm:ms-0">
                        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0 bg-background/80 px-2 py-0.5 rounded-md border border-border/40">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground leading-relaxed break-words">
                      <span className="font-semibold text-foreground">{displayAction}</span>{" "}
                      {isAr ? "على" : "on"}{" "}
                      <span className="font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        {act.entity}
                      </span>
                    </div>

                    <div className="text-[10px] text-primary/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pt-0.5">
                      <span>{isAr ? "اضغط لعرض تفاصيل العملية والشرح الكامل" : "Click for full details & payload"}</span>
                      <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityDetailsModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </>
  );
}


