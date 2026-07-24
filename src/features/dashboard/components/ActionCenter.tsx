"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionAlert } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";

interface ActionCenterProps {
  alerts?: ActionAlert[];
  isLoading?: boolean;
}

export function ActionCenter({ alerts, isLoading }: ActionCenterProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  if (isLoading) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Operational Action Center Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              ✓
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Operational Action Center — All Systems Clear</div>
              <div className="text-xs text-muted-foreground">No urgent booking reviews, unanswered inquiries, or capacity warnings pending.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-amber-500/10 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4" /> Operational Action Center ({alerts.length} Action Items Required)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 divide-y">
        {alerts.map((alert) => (
          <div key={alert.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{alert.title}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {alert.count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.reason}</p>
            </div>

            <Link href={`/${locale}${alert.actionLink}`}>
              <Button size="xs" variant="outline" className="gap-1 text-xs shrink-0">
                Action <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
