"use client";

import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardData";
import { Card } from "@/components/ui/card";
import { Users, CalendarCheck, DollarSign, Activity } from "lucide-react";
import { useParams } from "next/navigation";

export function BookingsHeaderStats() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const { data: summary, isLoading } = useDashboardSummary();

  const activeVisitors = summary?.conversion?.activeVisitors ?? summary?.operational?.activeVisitors ?? 0;
  const totalViews = summary?.conversion?.visitorViews ?? 0;
  const totalBookings = summary?.bookings?.total ?? 0;
  const grossRevenue = summary?.revenue?.grossRevenue;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-card/60 animate-pulse rounded-2xl border border-border/80" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* 1. Live Active Visitors */}
      <Card className="p-4 bg-card border border-border/80 shadow-xs hover:border-emerald-500/40 transition-all rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            {isAr ? "الزوار النشطون الآن في الموقع" : "Live Active Visitors"}
          </span>
          <div className="text-2xl font-black font-mono text-foreground tracking-tight flex items-baseline gap-2">
            <span>{activeVisitors}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              🟢 {isAr ? "نشط الآن" : "Active now"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            {isAr ? `إجمالي المشاهدات: ${totalViews}` : `Total Views: ${totalViews}`}
          </p>
        </div>
        <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shrink-0">
          <Users className="w-6 h-6 stroke-[2.2]" />
        </div>
      </Card>

      {/* 2. Total Bookings */}
      <Card className="p-4 bg-card border border-border/80 shadow-xs hover:border-amber-500/40 transition-all rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground">
            {isAr ? "إجمالي الحجوزات المسجلة" : "Total Bookings"}
          </span>
          <div className="text-2xl font-black font-mono text-foreground tracking-tight">
            {totalBookings}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            {isAr ? "تحديث تلقائي من النظام" : "Auto updated from system"}
          </p>
        </div>
        <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-500 shrink-0">
          <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
      </Card>

      {/* 3. Gross Revenue */}
      <Card className="p-4 bg-card border border-border/80 shadow-xs hover:border-indigo-500/40 transition-all rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground">
            {isAr ? "إجمالي الإيرادات" : "Gross Revenue"}
          </span>
          <div className="text-2xl font-black font-mono text-foreground tracking-tight">
            {grossRevenue == null ? "—" : `$${grossRevenue.toLocaleString()}`}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            {isAr ? "بالدولار الأمريكي ($ USD)" : "In USD ($)"}
          </p>
        </div>
        <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shrink-0">
          <DollarSign className="w-6 h-6 stroke-[2.2]" />
        </div>
      </Card>
    </div>
  );
}
