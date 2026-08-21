"use client";

import { useCompanyMetrics } from "../hooks/useCompanies";
import { Building2, Briefcase, DollarSign, Award, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CompanyMetricsBanner() {
  const tCompanies = useTranslations("companies");
  const tFinance = useTranslations("finance");

  const { data: rawMetrics, isLoading } = useCompanyMetrics();
  const metrics = (rawMetrics as any)?.totalCompanies !== undefined ? rawMetrics : (rawMetrics as any)?.data || rawMetrics;

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
      title: tCompanies("title"),
      value: metrics?.totalCompanies || 0,
      icon: Building2,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: tCompanies("travelAgencies"),
      value: metrics?.activeAgencies || 0,
      icon: Briefcase,
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20"
    },
    {
      title: tCompanies("corporateAccounts"),
      value: metrics?.activeCorporate || 0,
      icon: Award,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: tFinance("outstandingBalance"),
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics?.totalOutstandingBalance || 0),
      icon: DollarSign,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 group flex flex-col justify-between"
          >
            {/* Title on Top */}
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-extrabold text-muted-foreground group-hover:text-amber-500 transition-colors leading-tight">
                {stat.title}
              </p>
            </div>

            {/* Middle Row: Value on Right + Large Icon on Left at exact same height */}
            <div className="flex items-center justify-between gap-3 my-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-foreground tracking-tight dir-ltr text-start">
                {stat.value}
              </div>

              <div className={`p-3 rounded-2xl border ${stat.bg} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xs flex items-center justify-center`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.color} stroke-[2.2]`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
