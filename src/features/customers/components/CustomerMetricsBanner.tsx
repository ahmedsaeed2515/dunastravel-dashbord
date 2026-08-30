"use client";

import { useCustomerMetrics } from "../hooks/useCustomers";
import { Users, Star, AlertCircle, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CustomerMetricsBanner() {
  const { data: rawMetrics, isLoading } = useCustomerMetrics();
  const tCustomers = useTranslations("customers");
  const metrics = (rawMetrics as any)?.totalCustomers !== undefined ? rawMetrics : (rawMetrics as any)?.data || rawMetrics;

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border/80 flex items-center justify-center h-28">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "قاعدة العملاء النشطة",
      value: metrics.totalCustomers ?? 0,
      badge: `${metrics.newCustomers ? `+${metrics.newCustomers}` : "0"} عميل جديد هذا الشهر`,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "عملاء النخبة VIP Concierge",
      value: metrics.vipCustomers ?? 0,
      badge: "أعضاء برامج السياحة الفاخرة",
      icon: Star,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "الحسابات ذات الأرصدة المعلقة",
      value: metrics.customersWithOutstandingPayments ?? 0,
      badge: "تتطلب متابعة تحصيل الدفعات",
      icon: AlertCircle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "متوسط القيمة الإجمالية (LTV)",
      value: `$${(metrics.lifetimeValue || 0).toLocaleString()}`,
      badge: `متوسط الحجز: $${(metrics.averageBookingValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-0.5 group flex flex-col justify-between"
          >
            {/* Title on Top */}
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors leading-tight">
                {stat.title}
              </p>
            </div>

            {/* Middle Row: Value on Right + Icon on Left */}
            <div className="flex items-center justify-between gap-3 my-1">
              <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tracking-tight dir-ltr text-start">
                {stat.value}
              </div>

              <div className={`p-3 rounded-2xl border ${stat.bg} shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-xs flex items-center justify-center`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} stroke-[2.2]`} />
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
