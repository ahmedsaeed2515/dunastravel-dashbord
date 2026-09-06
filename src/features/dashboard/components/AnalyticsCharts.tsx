"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Crown, 
  ChevronLeft, 
  Flame,
  PieChart,
  ArrowDownRight,
  Plus,
  X,
  Calendar,
  Trash2,
  AlertTriangle
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

const STORAGE_KEY = "dunastravel_revenue_year_presets";
const DEFAULT_PRESETS = ["2026", "2025", "2024", "6m"];

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

  // Dynamic Year Presets State
  const [yearPresets, setYearPresets] = useState<string[]>(DEFAULT_PRESETS);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [yearError, setYearError] = useState<string | null>(null);
  const [yearToDelete, setYearToDelete] = useState<string | null>(null);
  const addYearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setYearPresets(parsed);
        }
      }
    } catch {
      // Fallback to default presets
    }
  }, []);

  // Close add year dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addYearRef.current && !addYearRef.current.contains(event.target as Node)) {
        setIsAddYearOpen(false);
        setYearError(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const savePresets = (presets: string[]) => {
    setYearPresets(presets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      // Ignore storage errors
    }
  };

  const handleAddYear = (yearVal?: string) => {
    const targetYear = (yearVal || newYearInput).trim();
    if (!/^\d{4}$/.test(targetYear)) {
      setYearError(isAr ? "يرجى إدخال سنة مكونة من 4 أرقام (مثال: 2027)" : "Please enter a valid 4-digit year (e.g. 2027)");
      return;
    }
    const numYear = parseInt(targetYear, 10);
    if (numYear < 2000 || numYear > 2099) {
      setYearError(isAr ? "يرجى إدخال سنة منطقية (بين 2000 و 2099)" : "Please enter a year between 2000 and 2099");
      return;
    }

    if (!yearPresets.includes(targetYear)) {
      // Keep "6m" at the end, sort numeric years descending
      const numericYears = yearPresets.filter((y) => /^\d{4}$/.test(y));
      if (!numericYears.includes(targetYear)) {
        numericYears.push(targetYear);
      }
      numericYears.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

      const updatedPresets = yearPresets.includes("6m")
        ? [...numericYears, "6m"]
        : numericYears;

      savePresets(updatedPresets);
    }

    onFilterChange?.({ ...filters, preset: targetYear });
    setNewYearInput("");
    setYearError(null);
    setIsAddYearOpen(false);
  };

  const onRequestDeleteYear = (presetToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (presetToDelete === "6m") return;
    if (yearPresets.filter((p) => p !== "6m").length <= 1) return; // Keep at least one year

    setYearToDelete(presetToDelete);
  };

  const handleConfirmDeleteYear = () => {
    if (!yearToDelete) return;
    const presetToDelete = yearToDelete;
    const updatedPresets = yearPresets.filter((p) => p !== presetToDelete);
    savePresets(updatedPresets);

    if (filters?.preset === presetToDelete) {
      const fallback = updatedPresets[0] || "2026";
      onFilterChange?.({ ...filters, preset: fallback });
    }
    setYearToDelete(null);
  };

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

  // Quick year suggestions to show in the add year popup
  const currentYearNum = new Date().getFullYear();
  const yearSuggestions = [
    String(currentYearNum + 1),
    String(currentYearNum),
    String(currentYearNum - 1),
    String(currentYearNum - 2),
    String(currentYearNum - 3),
  ].filter((y) => !yearPresets.includes(y));

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

        {/* Dynamic Year & Period Filter Bar with Add/Remove support */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border flex-wrap relative">
          {yearPresets.map((preset) => {
            const isSelected = activePreset === preset;
            const isDeletable = preset !== "6m" && yearPresets.filter((p) => p !== "6m").length > 1;
            const label = preset === "6m" ? (isAr ? "آخر 6 أشهر" : "Last 6 Months") : preset;
            
            return (
              <div key={preset} className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => onFilterChange?.({ ...filters, preset })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{label}</span>

                  {/* Quick Delete button on hover for custom years */}
                  {isDeletable && (
                    <span
                      role="button"
                      tabIndex={0}
                      title={isAr ? `إزالة سنة ${preset}` : `Remove year ${preset}`}
                      onClick={(e) => onRequestDeleteYear(preset, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onRequestDeleteYear(preset, e as any);
                        }
                      }}
                      className={`p-0.5 rounded-full transition-colors ${
                        isSelected
                          ? "hover:bg-amber-700 text-amber-100"
                          : "opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-500"
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Add Year Button & Dropdown Container */}
          <div className="relative" ref={addYearRef}>
            <button
              type="button"
              onClick={() => {
                setIsAddYearOpen(!isAddYearOpen);
                setYearError(null);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 transition-all duration-200 cursor-pointer"
              title={isAr ? "إضافة سنة جديدة للمقارنة" : "Add new year"}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "سنة" : "Year"}</span>
            </button>

            {/* Add Year Popover Form */}
            {isAddYearOpen && (
              <div className="absolute top-full inset-s-0 sm:inset-e-0 mt-2 w-72 p-4 rounded-2xl bg-card border border-border shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {isAr ? "إضافة سنة جديدة" : "Add Year"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddYearOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Input form */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={isAr ? "مثال: 2027" : "e.g. 2027"}
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddYear();
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-muted border border-border focus:border-amber-500 focus:outline-none font-mono"
                      min="2000"
                      max="2099"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleAddYear()}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      {isAr ? "إضافة" : "Add"}
                    </button>
                  </div>

                  {yearError && (
                    <p className="text-[11px] text-rose-500 font-semibold">{yearError}</p>
                  )}
                </div>

                {/* Quick suggestions if any */}
                {yearSuggestions.length > 0 && (
                  <div className="pt-1 border-t border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground block mb-1.5">
                      {isAr ? "اقتراحات سريعة:" : "Quick Suggestions:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {yearSuggestions.slice(0, 4).map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleAddYear(sug)}
                          className="px-2 py-0.5 rounded-lg bg-muted hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 border border-border/60 text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
      {/* Delete Year Confirmation Modal */}
      {yearToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isAr ? `تأكيد حذف سنة ${yearToDelete}` : `Confirm Deleting Year ${yearToDelete}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? `هل أنت متأكد من رغبتك في إزالة سنة ${yearToDelete} من فلتر الإيرادات؟` : `Are you sure you want to remove ${yearToDelete} from the revenue filter presets?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setYearToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteYear}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? "نعم، قم بالحذف" : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
