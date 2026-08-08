"use client";

import { useCustomerMetrics } from "../hooks/useCustomers";
import { Users, UserPlus, Star, AlertCircle, TrendingUp, HeartHandshake, Loader2 } from "lucide-react";

export function CustomerMetricsBanner() {
  const { data: rawMetrics, isLoading } = useCustomerMetrics();
  const metrics = (rawMetrics as any)?.totalCustomers !== undefined ? rawMetrics : (rawMetrics as any)?.data || rawMetrics;

  if (isLoading || !metrics) {
    return (
      <div className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total & New Customers */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-background/80 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/40 transition">
        <div className="absolute right-4 top-4 p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
          <Users className="h-6 w-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Active Client Database</span>
        <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
          {metrics.totalCustomers}
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{metrics.newCustomers ? `+${metrics.newCustomers}` : "0"} new clients registered this month</span>
        </div>
      </div>

      {/* VIP Concierge Segment */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-background/80 border border-border/80 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
        <div className="absolute right-4 top-4 p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
          <Star className="h-6 w-6 fill-amber-500" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">VIP Concierge Club</span>
        <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
          {metrics.vipCustomers}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <HeartHandshake className="h-3.5 w-3.5 text-amber-500" />
          <span>Exclusive luxury itinerary members</span>
        </div>
      </div>

      {/* Financial Health / Outstanding */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-background/80 border border-border/80 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
        <div className="absolute right-4 top-4 p-3 bg-rose-500/10 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
          <AlertCircle className="h-6 w-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Outstanding Ledgers</span>
        <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
          {metrics.customersWithOutstandingPayments}
        </div>
        <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
          <span>Action required: follow up on partial payments</span>
        </div>
      </div>

      {/* Customer Value & Loyalty */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-background/80 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/40 transition">
        <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
          <TrendingUp className="h-6 w-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Est. Lifetime Value (LTV)</span>
        <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
          ${metrics.lifetimeValue}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Avg booking value: <strong>${metrics.averageBookingValue}</strong></span>
        </div>
      </div>
    </div>
  );
}
