"use client";

import { useWalletMetrics, useCommissionMetrics } from "../hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Landmark, DollarSign, Clock } from "lucide-react";

export function FinanceMetricsBanner() {
  const { data: rawWallet, isLoading: walletLoading } = useWalletMetrics();
  const { data: rawCommission, isLoading: commissionLoading } = useCommissionMetrics();

  const walletData = (rawWallet as any)?.totalLiabilitiesUsd !== undefined ? rawWallet : (rawWallet as any)?.data || rawWallet;
  const commissionData = (rawCommission as any)?.totalPendingUsd !== undefined ? rawCommission : (rawCommission as any)?.data || rawCommission;

  const metrics = [
    {
      title: "Platform Liabilities (Wallets)",
      value: typeof walletData?.totalLiabilitiesUsd === "number" ? `$${walletData.totalLiabilitiesUsd.toLocaleString()}` : "$0",
      icon: Landmark,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      loading: walletLoading,
    },
    {
      title: "Active B2B Wallets",
      value: walletData?.totalCompanyWallets ?? 0,
      icon: Wallet,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      loading: walletLoading,
    },
    {
      title: "Pending Commissions",
      value: typeof commissionData?.totalPendingUsd === "number" ? `$${commissionData.totalPendingUsd.toLocaleString()}` : "$0",
      icon: Clock,
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      loading: commissionLoading,
    },
    {
      title: "Approved Payouts",
      value: typeof commissionData?.totalApprovedUsd === "number" ? `$${commissionData.totalApprovedUsd.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      loading: commissionLoading,
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
