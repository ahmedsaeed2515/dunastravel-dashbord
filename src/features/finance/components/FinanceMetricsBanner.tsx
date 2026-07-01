"use client";

import { useWalletMetrics, useCommissionMetrics } from "../hooks/useFinance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Landmark, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinanceMetricsBanner() {
  const { data: walletData, isLoading: walletLoading } = useWalletMetrics();
  const { data: commissionData, isLoading: commissionLoading } = useCommissionMetrics();

  const metrics = [
    {
      title: "Platform Liabilities (Wallets)",
      value: walletData ? `$${walletData.totalLiabilitiesUsd.toLocaleString()}` : "$0",
      icon: Landmark,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      loading: walletLoading,
    },
    {
      title: "Active B2B Wallets",
      value: walletData?.totalCompanyWallets || 0,
      icon: Wallet,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      loading: walletLoading,
    },
    {
      title: "Pending Commissions",
      value: commissionData ? `$${commissionData.totalPendingUsd.toLocaleString()}` : "$0",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      loading: commissionLoading,
    },
    {
      title: "Approved Payouts",
      value: commissionData ? `$${commissionData.totalApprovedUsd.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      loading: commissionLoading,
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
