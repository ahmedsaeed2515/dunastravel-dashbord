"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Crown, 
  ChevronLeft, 
  Flame,
  PieChart
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";

interface AnalyticsChartsProps {
  revenueTrend?: Array<{
    period: string;
    grossRevenue: number;
    collected: number;
    bookingsCount: number;
  }>;
  isLoadingRevenue?: boolean;
}

export function AnalyticsCharts({ revenueTrend, isLoadingRevenue }: AnalyticsChartsProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const [selectedYear, setSelectedYear] = useState<"2026" | "2025" | "6m">("2026");

  const dynamicTrend = Array.isArray(revenueTrend) && revenueTrend.length > 0
    ? revenueTrend.map((item) => {
        const d = new Date(item.period);
        const monthLabel = d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short" });
        return {
          month: monthLabel,
          amount: Number(item.grossRevenue ?? item.collected ?? 0),
          isPeak: false,
        };
      })
    : null;

  if (dynamicTrend && dynamicTrend.length > 0) {
    const maxVal = Math.max(...dynamicTrend.map((t) => t.amount));
    dynamicTrend.forEach((t) => {
      if (t.amount === maxVal && maxVal > 0) t.isPeak = true;
    });
  }

  // Monthly Revenue Chart Data matching the system baseline
  const fallbackMonthlyData = [
    { month: isAr ? "أغسطس" : "Aug", amount: 58400, isPeak: true },
    { month: isAr ? "يوليو" : "Jul", amount: 48200, isPeak: false },
    { month: isAr ? "يونيو" : "Jun", amount: 44100, isPeak: false },
    { month: isAr ? "مايو" : "May", amount: 41500, isPeak: false },
    { month: isAr ? "أبريل" : "Apr", amount: 32000, isPeak: false },
    { month: isAr ? "مارس" : "Mar", amount: 35800, isPeak: false },
    { month: isAr ? "فبراير" : "Feb", amount: 29400, isPeak: false },
    { month: isAr ? "يناير" : "Jan", amount: 26100, isPeak: false },
  ];

  const monthlyData = dynamicTrend && dynamicTrend.length > 0 ? dynamicTrend : fallbackMonthlyData;

  // Destinations breakdown data matching the image
  const destinations = [
    {
      name: isAr ? "EG مصر والرحلات النيلية" : "EG Egypt & Nile Cruises",
      percent: 48,
      amount: "$28,032",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      name: isAr ? "TR تركيا وكابادوكيا" : "TR Turkey & Cappadocia",
      percent: 22,
      amount: "$12,848",
      color: "bg-blue-600",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: isAr ? "JO الأردن والبتراء" : "JO Jordan & Petra",
      percent: 15,
      amount: "$8,768",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      name: isAr ? "MA المغرب واليونان ودبي" : "MA Morocco, Greece & Dubai",
      percent: 10,
      amount: "$5,840",
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      name: isAr ? "TN تونس والأرض المقدسة" : "TN Tunisia & Holy Land",
      percent: 5,
      amount: "$2,920",
      color: "bg-pink-500",
      textColor: "text-pink-600 dark:text-pink-400",
    },
  ];

  return (
    <Card className="p-5 sm:p-6 bg-card border border-border/80 rounded-3xl shadow-sm space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-4">
        {/* Right side in Arabic (Left in English): Title & Subtitle */}
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
              ? "تحليل شامل ومفصل لحركة الإيرادات، المبيعات الشهرية، ونسب النمو لعام 2026 مقارنة بالفترات السابقة."
              : "Comprehensive analysis of monthly revenue flow, sales performance, and 2026 growth ratios."}
          </p>
        </div>

        {/* Year Filter Buttons (Top-Left in Arabic) */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border">
          <button
            onClick={() => setSelectedYear("2026")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              selectedYear === "2026"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2026
          </button>
          <button
            onClick={() => setSelectedYear("2025")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              selectedYear === "2025"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2025
          </button>
          <button
            onClick={() => setSelectedYear("6m")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              selectedYear === "6m"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAr ? "آخر 6 أشهر" : "Last 6 Months"}
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Sales Rate */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "معدل المبيعات الشهري" : "Monthly Sales Rate"}
            </span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              $39,425 <span className="text-xs font-medium text-muted-foreground">{isAr ? "/شهر" : "/mo"}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
          </span>
        </div>

        {/* Card 2: Average Booking Value */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "متوسط قيمة الحجز الفردي" : "Average Booking Value"}
            </span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              $1,850
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
            <div className="text-base font-extrabold text-foreground">
              EG مصر <span className="text-xs font-semibold text-muted-foreground">(Egypt)</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            48%
          </span>
        </div>

        {/* Card 4: Booking Conversion Rate */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground block">
              {isAr ? "معدل تحويل الحجوزات" : "Booking Conversion Rate"}
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              92.5%
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {isAr ? "الرسم البياني لحركة الإيرادات الشهرية ($ USD)" : "Monthly Revenue Trend Chart ($ USD)"}
            </h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {isAr ? "أغسطس 2026: الأعلى نمواً" : "Aug 2026: Peak Month"}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
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
                  tickFormatter={(val) => `$${val / 1000}k`}
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
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? "#d97706" : "#3b82f6"}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Peak Month Badge on top of August */}
            <div className="absolute top-0 right-8 sm:right-10 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md animate-bounce">
              <Crown className="w-3 h-3 fill-slate-950" />
              <span>{isAr ? "القمة 👑" : "Peak 👑"}</span>
            </div>
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
              {destinations.map((dest, idx) => (
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
              ))}
            </div>
          </div>

          {/* Bottom Action Button */}
          <Link
            href={adminRoutes.finance.commissions}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            <span>{isAr ? "استعراض تقارير المالية الحجز الكاملة" : "View Full Financial Reports"}</span>
            <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
