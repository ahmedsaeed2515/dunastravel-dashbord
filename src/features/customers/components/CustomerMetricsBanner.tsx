"use client";

import { useCustomerMetrics } from "../hooks/useCustomers";
import { Users, Star, AlertCircle, TrendingUp, HeartHandshake, Loader2 } from "lucide-react";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export function CustomerMetricsBanner() {
  const { data: rawMetrics, isLoading, isError, refetch } = useCustomerMetrics();
  const metrics = (rawMetrics as any)?.totalCustomers !== undefined ? rawMetrics : (rawMetrics as any)?.data || rawMetrics;

  if (isError) {
    return <QueryErrorState message="تعذر تحميل مؤشرات العملاء من الباك إند." onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border flex items-center justify-center h-27.5">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Client Database",
      value: metrics.totalCustomers,
      badge: `${metrics.newCustomers ? `+${metrics.newCustomers}` : "0"} new clients this month`,
      icon: Users,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "VIP Concierge Club",
      value: metrics.vipCustomers,
      badge: "Exclusive luxury itinerary members",
      icon: Star,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Outstanding Ledgers",
      value: metrics.customersWithOutstandingPayments,
      badge: "Follow up on partial payments",
      icon: AlertCircle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "Est. Lifetime Value (LTV)",
      value: `$${metrics.lifetimeValue}`,
      badge: `Avg booking: $${metrics.averageBookingValue}`,
      icon: TrendingUp,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 group flex flex-col justify-between"
          >
            {/* Title on Top */}
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors leading-tight">
                {stat.title}
              </p>
            </div>

            {/* Middle Row: Value on Right + Icon on Left at exact same level */}
            <div className="flex items-center justify-between gap-3 my-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-foreground tracking-tight dir-ltr text-start">
                {stat.value}
              </div>

              <div className={`p-3 rounded-2xl border ${stat.bg} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xs flex items-center justify-center`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.color} stroke-[2.2]`} />
              </div>
            </div>

            {/* Subtitle Badge */}
            <div className="mt-3 pt-2.5 border-t border-border/50 text-[11px] font-bold text-muted-foreground">
              {stat.badge}
            </div>
          </div>
        );
      })}
    </div>
  );
}
