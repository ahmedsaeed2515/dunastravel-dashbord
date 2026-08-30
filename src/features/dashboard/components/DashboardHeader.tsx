"use client";

import { Clock, ShieldCheck, Activity, Database, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { DashboardFilters } from "../types";

interface DashboardHeaderProps {
  filters?: DashboardFilters;
  onFilterChange?: (filters: DashboardFilters) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ filters, onFilterChange, onRefresh, isRefreshing }: DashboardHeaderProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  return (
    <div className="border-b border-border/80 pb-5 pt-2">
      <div className="flex flex-col space-y-2.5">
        {/* Main Title with Large Prominent Icons */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Main Shield Icon Container - Large & Clear */}
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5 shrink-0 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span>{isAr ? "مركز الإدارة والعمليات التشغيلية" : "Executive & Operations Command Center"}</span>
            </h1>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-500 animate-pulse stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Subtitle with Large Clear Icons */}
        <div className="text-xs sm:text-sm text-muted-foreground font-bold flex items-center gap-3.5 flex-wrap pt-1">
          <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            <Database className="w-5 h-5 shrink-0 stroke-[2.2]" />
            <span>{isAr ? "المصدر الموحد للبيانات" : "Single Source of Truth"}</span>
          </span>

          <span className="text-muted-foreground/40 hidden sm:inline">•</span>

          <span className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0 stroke-[2.2]" />
            <span>{isAr ? "مؤشرات فورية وقاعدة بيانات متزامنة (Timezone: UTC)" : "Real-Time Database Metrics (Timezone: UTC)"}</span>
          </span>

          <span className="text-muted-foreground/40 hidden md:inline">•</span>

          <span className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 stroke-[2.2]" />
            <span>{isAr ? "نظام الإدارة المركزية" : "Centralized Enterprise Operations"}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <select
            aria-label={isAr ? "فترة لوحة التحكم" : "Dashboard period"}
            value={filters?.preset ?? 'all'}
            onChange={(event) => onFilterChange?.({ ...filters, preset: event.target.value as DashboardFilters['preset'] })}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground focus:outline-hidden"
          >
            <option value="all">{isAr ? "آخر 12 شهراً (الكل)" : "Last 12 months (All)"}</option>
            <option value="30d">{isAr ? "آخر 30 يوماً" : "Last 30 days"}</option>
            <option value="90d">{isAr ? "آخر 90 يوماً" : "Last 90 days"}</option>
            <option value="12m">{isAr ? "آخر 12 شهراً" : "Last 12 months"}</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl border border-border bg-card hover:bg-muted/80 px-3 py-1.5 text-xs font-bold text-foreground disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isRefreshing ? (isAr ? 'جاري التحديث…' : 'Refreshing…') : (isAr ? 'تحديث البيانات 🔄' : 'Refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}
