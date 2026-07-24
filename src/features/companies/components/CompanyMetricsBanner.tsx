"use client";

import { useCompanyMetrics } from "../hooks/useCompanies";
import { Building2, Briefcase, DollarSign, Award, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CompanyMetricsBanner() {
  const tCompanies = useTranslations("companies");
  const tFinance = useTranslations("finance");

  const { data: metrics, isLoading } = useCompanyMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#0C1C48]/30 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 flex items-center justify-center h-[104px]">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
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
      color: "text-primary dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: tCompanies("travelAgencies"),
      value: metrics?.activeAgencies || 0,
      icon: Briefcase,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      title: tCompanies("corporateAccounts"),
      value: metrics?.activeCorporate || 0,
      icon: Award,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      title: tFinance("outstandingBalance"),
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics?.totalOutstandingBalance || 0),
      icon: DollarSign,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-900/40 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold font-playfair text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors dir-ltr text-start">{stat.value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
