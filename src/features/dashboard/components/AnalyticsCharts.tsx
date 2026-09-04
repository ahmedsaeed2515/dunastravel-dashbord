"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Crown, 
  ChevronLeft, 
  Flame,
  PieChart,
  ArrowDownRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";
import {
  DashboardFilters,
  ExecutiveSummary,
  RevenueTrendItem,
  RevenueTrendResponse,
  TopDestinationItem,
} from "../types";

interface AnalyticsChartsProps {
  revenueTrend?: RevenueTrendResponse | RevenueTrendItem[];
  topDestinations?: TopDestinationItem[];
  summary?: ExecutiveSummary;
  filters?: DashboardFilters;
  onFilterChange?: (filters: DashboardFilters) => void;
  isLoadingRevenue?: boolean;
}

export function AnalyticsCharts({
  revenueTrend,
  topDestinations,
  summary,
  filters,
  onFilterChange,
  isLoadingRevenue,
}: AnalyticsChartsProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const trendItems = useMemo<RevenueTrendItem[]>(() => {
    if (Array.isArray(revenueTrend)) return revenueTrend;
    if (revenueTrend && Array.isArray(revenueTrend.trend)) return revenueTrend.trend;
    return [];
  }, [revenueTrend]);

  const backendAnalytics = useMemo(() => {
    if (revenueTrend && !Array.isArray(revenueTrend) && revenueTrend.analytics) {
      return revenueTrend.analytics;
    }
    return null;
  }, [revenueTrend]);

  // Dynamic calculations
  const totalGross = trendItems.reduce((acc, t) => acc + (t.grossRevenue || 0), 0);
  const activeMonthsCount = trendItems.filter((t) => (t.grossRevenue || 0) > 0).length || trendItems.length || 1;
  const monthlySalesRate = backendAnalytics?.monthlySalesRate ?? Math.round(totalGross / activeMonthsCount);
  const monthlyGrowth = backendAnalytics?.monthlyGrowthPercent ?? summary?.revenue?.revenueChangePercent ?? 0;
  
  const confirmedBookingsCount = trendItems.reduce((acc, t) => acc + (t.bookingsCount || 0), 0);
  const avgBookingValue = backendAnalytics?.averageBookingValue ?? (
    confirmedBookingsCount > 0
      ? Math.round(totalGross / confirmedBookingsCount)
      : (summary?.bookings?.total ? Math.round((summary?.revenue?.grossRevenue || 0) / summary.bookings.total) : 0)
  );

  const topDestination = backendAnalytics?.topDestination ?? (
    Array.isArray(topDestinations) && topDestinations.length > 0 ? topDestinations[0] : null
  );

  const bookingConversionRate = backendAnalytics?.bookingConversionRate ?? (summary?.conversion?.rate ?? 0);

  // Peak month determination
  const maxRevenue = Math.max(0, ...trendItems.map((t) => Number(t.grossRevenue || 0)));

  const chartData = useMemo(() => {
    if (trendItems.length === 0) {
      return [
        { month: isAr ? "يناير" : "Jan", amount: 0, isPeak: false },
        { month: isAr ? "فبراير" : "Feb", amount: 0, isPeak: false },
        { month: isAr ? "مارس" : "Mar", amount: 0, isPeak: false },
        { month: isAr ? "أبريل" : "Apr", amount: 0, isPeak: false },
        { month: isAr ? "مايو" : "May", amount: 0, isPeak: false },
        { month: isAr ? "يونيو" : "Jun", amount: 0, isPeak: false },
        { month: isAr ? "يوليو" : "Jul", amount: 0, isPeak: false },
        { month: isAr ? "أغسطس" : "Aug", amount: 0, isPeak: false },
      ];
    }
    return trendItems.map((item) => {
      const d = new Date(item.period);
      const monthLabel = item.month || d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short" });
      const amount = Number(item.grossRevenue ?? item.collected ?? 0);
      return {
        month: monthLabel,
        amount,
        isPeak: maxRevenue > 0 && amount === maxRevenue,
      };
    });
  }, [trendItems, maxRevenue, isAr]);

  const peakItem = chartData.find((t) => t.isPeak);
  const peakLabel = backendAnalytics?.peakMonth
    ? (isAr ? backendAnalytics.peakMonth.labelAr || backendAnalytics.peakMonth.label : backendAnalytics.peakMonth.label)
    : peakItem
    ? `${peakItem.month} (Peak)`
    : isAr ? "الذروة الحالية" : "Current Peak";

  // Destinations breakdown list
  const destinationList = useMemo(() => {
    if (Array.isArray(topDestinations) && topDestinations.length > 0) {
      return topDestinations.slice(0, 5).map((d) => ({
        name: isAr ? `${d.countryCode} ${d.nameAr || d.name}` : `${d.countryCode} ${d.name}`,
        percent: d.sharePercent,
        amount: `$${Number(d.grossRevenue || d.collectedRevenue || 0).toLocaleString()}`,
        color: d.color || "bg-amber-500",
        textColor: "text-foreground font-semibold",
      }));
    }
    return [];
  }, [topDestinations, isAr]);

  const activePreset = filters?.preset || "2026";

  return (
    <Card className="p-5 sm:p-6 bg-card border border-border/80 rounded-3xl shadow-sm space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              {isAr ? "اتجاه الإيرادات والنمو الشهري" : "Revenue Trend Analytics"}
              <span className="text-xs font-bold text-muted-foreground dir-ltr">
                (Revenue Trend Analytics)
              </span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            {isAr
              ? "تحليل شامل ومفصل لحركة الإيرادات، المبيعات الشهرية، ونسب النمو الفعلي المحسوبة من قاعدة البيانات."
              : "Comprehensive analysis of monthly revenue flow, sales performance, and real growth ratios."}
          </p>
        </div>

        {/* Year & Period Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border">
          {(["2026", "2025", "6m"] as const).map((preset) => {
            const isSelected = activePreset === preset;
            const label = preset === "6m" ? (isAr ? "آخر 6 أشهر" : "Last 6 Months") : preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onFilterChange?.({ ...filters, preset })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Row (100% Dynamic from Backend) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Sales Rate */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "معدل المبيعات الشهري" : "Monthly Sales Rate"}
            </span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              ${monthlySalesRate.toLocaleString()}{" "}
              <span className="text-xs font-medium text-muted-foreground">
                {isAr ? "/شهر" : "/mo"}
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
              monthlyGrowth >= 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
          >
            {monthlyGrowth >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {monthlyGrowth >= 0 ? "+" : ""}
            {monthlyGrowth}%
          </span>
        </div>

        {/* Card 2: Average Booking Value */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "متوسط قيمة الحجز الفردي" : "Average Booking Value"}
            </span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              ${avgBookingValue.toLocaleString()}
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {isAr ? "لكل حاجز" : "Per Client"}
          </span>
        </div>

        {/* Card 3: Top Revenue Destination */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "الوجهة الأعلى تحصيلاً" : "Top Revenue Destination"}
            </span>
            <div className="text-base font-extrabold text-foreground truncate max-w-35 sm:max-w-45">
              {topDestination
                ? `${topDestination.countryCode} ${isAr ? topDestination.nameAr || topDestination.name : topDestination.name}`
                : "—"}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            {topDestination ? `${topDestination.sharePercent}%` : "0%"}
          </span>
        </div>

        {/* Card 4: Booking Conversion Rate */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "معدل تحويل الحجوزات" : "Booking Conversion Rate"}
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {bookingConversionRate}%
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {isAr ? "مكتمل ومؤكد" : "Confirmed"}
          </span>
        </div>
      </div>

      {/* 3. Main Split Section: Chart & Destination Breakdown */}
      <div className="grid gap-6 lg:grid-cols-12 pt-2">
        {/* Main Column: Bar Chart (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {isAr ? "الرسم البياني لحركة الإيرادات الشهرية ($ USD)" : "Monthly Revenue Trend Chart ($ USD)"}
            </h3>
            {peakItem && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {peakLabel}: {isAr ? "الأعلى نمواً" : "Peak Month"}
              </span>
            )}
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-64 sm:h-72 w-full pt-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="month" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    stroke="#94a3b8" 
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()} USD`, isAr ? "الإيراد" : "Revenue"]}
                    contentStyle={{ 
                      borderRadius: "12px", 
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      color: "#fff",
                      border: "1px solid rgba(217, 119, 6, 0.3)",
                      fontWeight: "bold"
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isPeak ? "#d97706" : "#3b82f6"}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}

            {/* Peak Month Badge placed dynamically */}
            {peakItem && (
              <div className="absolute top-0 inset-e-8 sm:inset-e-10 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md animate-bounce">
                <Crown className="w-3 h-3 fill-slate-950" />
                <span>{isAr ? "القمة 👑" : "Peak 👑"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Side Column: Destination Revenue Breakdown (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 p-5 rounded-2xl bg-muted/30 border border-border flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
              <PieChart className="w-4 h-4 text-amber-500" />
              {isAr ? "توزيع الإيرادات حسب الواجهات الـ 8 🕓" : "Revenue by Destinations 🕓"}
            </h3>

            {/* Destination Items List */}
            <div className="space-y-3.5">
              {destinationList.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {isAr ? "لا توجد بيانات إيرادات متاحة لهذه الفترة." : "No revenue records for this period."}
                </div>
              ) : (
                destinationList.map((dest, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{dest.name}</span>
                      <span className={`font-mono ${dest.textColor}`}>
                        ({dest.percent}%) {dest.amount}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dest.color} rounded-full transition-all duration-500`}
                        style={{ width: `${dest.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Action Button */}
          <Link
            href={adminRoutes.finance.root}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            <span>{isAr ? "استعراض تقارير المالية الكاملة" : "View Full Financial Reports"}</span>
            <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
