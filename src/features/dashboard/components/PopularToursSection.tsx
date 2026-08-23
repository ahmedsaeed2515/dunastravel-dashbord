"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Flame, 
  MapPin, 
  ArrowUpRight,
  CalendarCheck,
  Compass,
  Layers
} from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { adminRoutes } from "@/config/admin-routes";
import { DashboardFilters, TourPerformanceItem } from "../types";
import { useTourPerformance } from "../hooks/useDashboardData";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

interface PopularToursSectionProps {
  filters?: DashboardFilters;
}

export function PopularToursSection({ filters }: PopularToursSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");

  const { data, isLoading, isError, refetch } = useTourPerformance(filters);

  if (isError) {
    return <QueryErrorState message="تعذر تحميل أداء الرحلات من الباك إند." onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return (
      <Card className="p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-xs space-y-4">
        <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const allTours: TourPerformanceItem[] = (data as any)?.all || [];
  const mostBooked: TourPerformanceItem[] = (data as any)?.rankings?.mostBooked || [];
  const displayTours = mostBooked.length > 0 ? mostBooked.slice(0, 4) : allTours.slice(0, 4);

  if (displayTours.length === 0) {
    return null;
  }

  const getTourTitle = (tour: TourPerformanceItem) => {
    if (!tour.titleJsonb) return tour.slug;
    if (typeof tour.titleJsonb === "string") return tour.titleJsonb;
    return tour.titleJsonb[locale] || tour.titleJsonb["en"] || tour.titleJsonb["ar"] || tour.slug;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="p-5 sm:p-6 bg-card border border-border/80 rounded-2xl shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">
              {t("popularTours")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("popularToursSubtitle")}
          </p>
        </div>

        <Link
          href={adminRoutes.tours}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>{t("viewAllTours")}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards Grid: 4 Real Tours */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayTours.map((tour, idx) => {
          const title = getTourTitle(tour);
          const heroImg = tour.heroImage;

          return (
            <Link key={tour.id || idx} href={`${adminRoutes.tours}/${tour.slug}`} className="block group">
              <Card className="overflow-hidden bg-card border border-border/80 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 rounded-2xl h-full flex flex-col justify-between">
                <div>
                  {/* Hero Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                    {heroImg ? <img src={heroImg} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" /> : <div className="h-full w-full bg-muted" />}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/20" />
                    
                    {/* Rank Badge */}
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-xs font-mono">
                      #{idx + 1}
                    </span>

                    {/* Destination Pill */}
                    <div className="absolute bottom-2.5 right-2.5 text-xs font-semibold text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span className="text-[11px] text-slate-200">{tour.country || tour.category || "—"}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3.5 space-y-2">
                    <h3 className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug" title={title}>
                      {title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CalendarCheck className="w-3 h-3" />
                        <span>{tour.confirmedBookings || tour.totalBookings || 0} {isAr ? "حجز" : "bookings"}</span>
                      </span>
                      {tour.totalRevenue > 0 && (
                        <span className="font-mono font-bold text-foreground text-[11px]">
                          {formatCurrency(tour.totalRevenue)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Footer */}
                <div className="px-3.5 py-2.5 flex items-center justify-between border-t border-border/40 bg-muted/20 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isAr ? "السعر يبدأ من" : "From"}</span>
                    <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                      {formatCurrency(tour.basePriceUsd || 0)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground group-hover:text-amber-500 transition-colors flex items-center gap-0.5">
                    {isAr ? "تفاصيل" : "Details"}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
