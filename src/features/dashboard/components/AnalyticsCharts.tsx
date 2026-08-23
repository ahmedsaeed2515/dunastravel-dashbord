"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  MapPin, 
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { adminRoutes } from "@/config/admin-routes";
import { RevenueTrendItem, TopDestinationItem, DashboardFilters } from "../types";
import { useRevenueTrend, useTopDestinations } from "../hooks/useDashboardData";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

interface AnalyticsChartsProps {
  filters?: DashboardFilters;
  revenueTrend?: RevenueTrendItem[];
  isLoadingRevenue?: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
  label?: string;
  metricMode: "revenue" | "bookings";
  locale: string;
}

function ChartTooltip({ active, payload, label, metricMode, locale }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const formatCurrency = (value: number) => new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className="p-3 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl text-xs space-y-1.5 min-w-[150px]">
      <p className="font-bold text-foreground border-b border-border pb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}</span>
          </span>
          <span className="font-mono font-bold text-foreground">
            {metricMode === "revenue" ? formatCurrency(entry.value ?? 0) : `${entry.value ?? 0} bookings`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsCharts({ filters, revenueTrend: propTrend, isLoadingRevenue }: AnalyticsChartsProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");

  const [metricMode, setMetricMode] = useState<"revenue" | "bookings">("revenue");

  // Query real data if not provided in props
  const trendQuery = useRevenueTrend(filters);
  const destinationsQuery = useTopDestinations(filters);
  const { data: queriedTrend, isLoading: trendLoading } = trendQuery;
  const { data: topDestinations, isLoading: destLoading } = destinationsQuery;

  if (trendQuery.isError || destinationsQuery.isError) {
    return <QueryErrorState message="تعذر تحميل تحليلات الإيرادات والوجهات من الباك إند." onRetry={() => void Promise.all([trendQuery.refetch(), destinationsQuery.refetch()])} />;
  }

  const rawTrend = propTrend || queriedTrend || [];
  const loading = isLoadingRevenue || trendLoading;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  // Format date buckets for X-Axis cleanly
  const formattedChartData = rawTrend.map((item) => {
    const rawDate = item.period;
    let label = rawDate;
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        label = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
          month: "short",
          day: "numeric",
        }).format(d);
      }
    } catch {
      label = rawDate;
    }

    return {
      period: label,
      rawPeriod: item.period,
      grossRevenue: Number(item.grossRevenue || 0),
      collected: Number(item.collected || 0),
      bookingsCount: Number(item.bookingsCount || 0),
    };
  });

  // Calculate totals for summary strip
  const totalGrossInPeriod = formattedChartData.reduce((acc, cur) => acc + cur.grossRevenue, 0);
  const totalCollectedInPeriod = formattedChartData.reduce((acc, cur) => acc + cur.collected, 0);
  const totalBookingsInPeriod = formattedChartData.reduce((acc, cur) => acc + cur.bookingsCount, 0);
  const abv = totalBookingsInPeriod > 0 ? totalGrossInPeriod / totalBookingsInPeriod : 0;

  const destinationsList: TopDestinationItem[] = topDestinations || [];

  return (
    <div className="grid gap-5 lg:grid-cols-12 items-start">
      {/* 1. Revenue & Sales Trend Chart (7 cols on lg) */}
      <Card className="lg:col-span-7 p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-xs space-y-5">
        {/* Header with Title & Metric Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <BarChart3 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-extrabold text-foreground">
                {t("revenueTrend")}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("revenueTrendSubtitle")}
            </p>
          </div>

          {/* Metric Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setMetricMode("revenue")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                metricMode === "revenue"
                  ? "bg-card text-foreground shadow-xs border border-border text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? "الإيرادات ($)" : "Revenue ($)"}
            </button>
            <button
              onClick={() => setMetricMode("bookings")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                metricMode === "bookings"
                  ? "bg-card text-foreground shadow-xs border border-border text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? "الحجوزات (#)" : "Bookings (#)"}
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 sm:h-72 w-full pt-2" dir="ltr">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              Loading financial trends...
            </div>
          ) : formattedChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
              <Calendar className="w-8 h-8 text-muted-foreground/40" />
              <span>{t("noRevenueData")}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {metricMode === "revenue" ? (
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grossRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<ChartTooltip metricMode={metricMode} locale={locale} />} />
                  <Area
                    type="monotone"
                    dataKey="grossRevenue"
                    name={isAr ? "المبيعات الإجمالية" : "Gross Volume"}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#grossRevGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    name={isAr ? "المدفوعات المحصلة" : "Collected Net"}
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#collectedGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip metricMode={metricMode} locale={locale} />} />
                  <Bar
                    dataKey="bookingsCount"
                    name={isAr ? "عدد الحجوزات" : "Bookings Count"}
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Micro-Summary Stats Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              {isAr ? "المبيعات بالفترة" : "Period Gross"}
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-foreground">
              {formatCurrency(totalGrossInPeriod)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              {isAr ? "التحصيل الصافي" : "Net Captured"}
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCollectedInPeriod)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              {isAr ? "متوسط الحجز" : "Average Order"}
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-amber-600 dark:text-amber-400">
              {formatCurrency(abv)}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Top Destinations Performance Breakdown (5 cols on lg) */}
      <Card className="lg:col-span-5 p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <MapPin className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-extrabold text-foreground">
                {t("topDestinations")}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("topDestinationsSubtitle")}
            </p>
          </div>

          <Link
            href={adminRoutes.destinations}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>{isAr ? "الواجهات" : "All"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Destinations List */}
        <div className="space-y-3.5 pt-1">
          {destLoading ? (
            <div className="space-y-3 py-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted/60 rounded-xl" />
              ))}
            </div>
          ) : destinationsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {t("noDestinationsData")}
            </div>
          ) : (
            destinationsList.slice(0, 5).map((dest, idx) => {
              const displayName = isAr ? (dest.nameAr || dest.name) : dest.name;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted font-bold border border-border">
                        {dest.countryCode || "GL"}
                      </span>
                      <span className="text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-muted-foreground text-[11px]">
                        {dest.bookingsCount} {isAr ? "حجز" : "bkgs"}
                      </span>
                      <span className="text-foreground font-extrabold">
                        {formatCurrency(dest.grossRevenue)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Real Percentage */}
                  <div className="w-full bg-muted/70 h-2 rounded-full overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${dest.color || "bg-amber-500"}`}
                      style={{ width: `${Math.max(dest.sharePercent, 4)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{isAr ? "الحصة من المبيعات" : "Revenue Share"}</span>
                    <span className="font-bold font-mono text-foreground">{dest.sharePercent}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
