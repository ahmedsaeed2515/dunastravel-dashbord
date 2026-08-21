"use client";

import { useCommunicationMetrics } from "../hooks/useCommunications";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, AlertTriangle, Clock, Activity } from "lucide-react";

export function CommunicationsMetricsBanner() {
  const { data: rawData, isLoading } = useCommunicationMetrics();
  const data = (rawData as any)?.totalSent !== undefined ? rawData : (rawData as any)?.data || rawData;

  const metrics = [
    {
      title: "Total Delivered",
      value: data?.totalSent || 0,
      icon: Send,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      loading: isLoading,
    },
    {
      title: "Delivery Success Rate",
      value: data ? `${data.successRate}%` : "0%",
      icon: Activity,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      loading: isLoading,
    },
    {
      title: "In Transit (Pending)",
      value: data?.totalPending || 0,
      icon: Clock,
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      loading: isLoading,
    },
    {
      title: "Failed Deliveries",
      value: data?.totalFailed || 0,
      icon: AlertTriangle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      loading: isLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <div 
            key={i} 
            className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 group flex flex-col justify-between"
          >
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors leading-tight">
                {metric.title}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 my-1">
              {metric.loading ? (
                <Skeleton className="h-9 w-24 rounded-lg" />
              ) : (
                <div className="text-3xl sm:text-4xl font-black font-mono text-foreground tracking-tight dir-ltr text-start">
                  {metric.value}
                </div>
              )}

              <div className={`p-3 rounded-2xl border ${metric.bg} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xs flex items-center justify-center`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${metric.color} stroke-[2.2]`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
