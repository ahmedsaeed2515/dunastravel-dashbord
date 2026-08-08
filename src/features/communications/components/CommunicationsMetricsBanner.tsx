"use client";

import { useCommunicationMetrics } from "../hooks/useCommunications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, AlertTriangle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommunicationsMetricsBanner() {
  const { data: rawData, isLoading } = useCommunicationMetrics();
  const data = (rawData as any)?.totalSent !== undefined ? rawData : (rawData as any)?.data || rawData;

  const metrics = [
    {
      title: "Total Delivered",
      value: data?.totalSent || 0,
      icon: Send,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      loading: isLoading,
    },
    {
      title: "Delivery Success Rate",
      value: data ? `${data.successRate}%` : "0%",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      loading: isLoading,
    },
    {
      title: "In Transit (Pending)",
      value: data?.totalPending || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      loading: isLoading,
    },
    {
      title: "Failed Deliveries",
      value: data?.totalFailed || 0,
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      loading: isLoading,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {metrics.map((metric, i) => (
        <Card key={i} className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={cn("p-2 rounded-full", metric.bg)}>
              <metric.icon className={cn("h-4 w-4", metric.color)} />
            </div>
          </CardHeader>
          <CardContent>
            {metric.loading ? (
              <Skeleton className="h-7 w-[100px] mt-1" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {metric.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
