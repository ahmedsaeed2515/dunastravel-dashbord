"use client";

import React from "react";
import { 
  RotateCw, 
  Calendar, 
  Plus, 
  Sparkles,
  Filter,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DashboardFilters } from "../types";
import { adminRoutes } from "@/config/admin-routes";

interface DashboardHeaderProps {
  filters?: DashboardFilters;
  onFilterChange?: (filters: DashboardFilters) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  filters = {},
  onFilterChange,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");
  const { user } = useAuth();

  const userName = user?.name ? user.name.split(" ")[0] : (isAr ? "عطية" : "Attia");

  const today = new Date();
  const dateFormatted = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : locale === "it" ? "it-IT" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(today);

  const activePreset = filters.preset || "all";

  const handlePresetSelect = (preset: 'all' | '30d' | '90d' | '12m') => {
    if (!onFilterChange) return;
    const now = new Date();
    let from: string | undefined = undefined;
    const to = now.toISOString();

    if (preset === '30d') {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (preset === '90d') {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (preset === '12m') {
      from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    onFilterChange({
      ...filters,
      preset,
      from,
      to: from ? to : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-2 pt-1 border-b border-border/70">
      {/* Top row: Greeting, Live Status & Quick Action CTAs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
              {isAr ? `مرحباً، ${userName}` : `Welcome back, ${userName}`}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>{t("liveSync")}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span>{dateFormatted}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="font-medium">{t("operationalCommandCenter")}</span>
          </p>
        </div>

        {/* Action Group: Refresh & Create CTAs */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={t("refreshData")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-card border border-border hover:bg-accent text-foreground transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t("refreshData")}</span>
            </button>
          )}

          {/* New Booking CTA */}
          <Link
            href={adminRoutes.bookings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/15 transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t("newBooking")}</span>
          </Link>

          {/* New Inquiry CTA */}
          <Link
            href={adminRoutes.inquiries}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/60 transition-all duration-150 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("newInquiry")}</span>
          </Link>
        </div>
      </div>

      {/* Bottom row: Period Presets Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/80">
          <Filter className="w-3.5 h-3.5 text-muted-foreground ms-1.5 me-0.5" />
          {(
            [
              { key: "all", label: t("allPeriods") },
              { key: "30d", label: t("last30Days") },
              { key: "90d", label: t("last90Days") },
              { key: "12m", label: t("last12Months") },
            ] as const
          ).map((preset) => {
            const isActive = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handlePresetSelect(preset.key)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-card text-foreground shadow-xs border border-border font-bold text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
