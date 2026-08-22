"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TourPerformanceItem, TourRankings } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, TrendingUp, AlertTriangle, Eye, Edit, ExternalLink, Flame, Star } from "lucide-react";

interface ToursPerformanceSectionProps {
  rankings?: TourRankings;
  isLoading?: boolean;
}

export function ToursPerformanceSection({ rankings, isLoading }: ToursPerformanceSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isRtl = locale === "ar";
  const [activeTab, setActiveTab] = useState<"topRevenue" | "mostBooked" | "lowConversion" | "capacityAlerts">("topRevenue");

  if (isLoading || !rankings) {
    return (
      <Card className="shadow-xs border-border/80 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>{isRtl ? "جاري تحميل ترتيب الرحلات الأكثر إقبالاً..." : "Loading Tours Performance Rankings..."}</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const currentList: TourPerformanceItem[] = rankings[activeTab] || [];

  return (
    <Card className="shadow-xs border-border/80 bg-card">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground font-bold">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>{isRtl ? "أكثر الرحلات إقبالاً وأداءً (Tours Performance)" : "Top Popular & Best Performing Tours"}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRtl ? "تحليل شامل ومباشر لمبيعات الرحلات والإشغال والإيرادات" : "Real-time multi-dimensional operational and revenue tour analytics"}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("topRevenue")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "topRevenue" ? "bg-background shadow-xs text-amber-500 font-bold border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
          >
            {isRtl ? "الأعلى إيراداً" : "Top Revenue"}
          </button>
          <button
            onClick={() => setActiveTab("mostBooked")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "mostBooked" ? "bg-background shadow-xs text-amber-500 font-bold border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
          >
            {isRtl ? "الأكثر حجزاً" : "Most Booked"}
          </button>
          <button
            onClick={() => setActiveTab("lowConversion")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "lowConversion" ? "bg-background shadow-xs text-rose-500 font-bold border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
          >
            {isRtl ? "تنبيه التحويل" : "Low Conversion"}
          </button>
          <button
            onClick={() => setActiveTab("capacityAlerts")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "capacityAlerts" ? "bg-background shadow-xs text-amber-500 font-bold border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
          >
            {isRtl ? "إشغال مرتفع (>80%)" : "High Capacity (>80%)"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {currentList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            {isRtl ? "لا توجد رحلات مطابقة لهذا المعيار في الفترة المحددة." : "No tours match this criteria for selected period."}
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((tour, idx) => (
              <div 
                key={tour.id} 
                className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  {/* Luxury Medal Ranking Badge */}
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border shadow-xs
                    ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10' :
                      idx === 1 ? 'bg-slate-300/20 text-slate-200 border-slate-400/40' :
                      idx === 2 ? 'bg-amber-800/20 text-amber-600 border-amber-700/40' :
                      'bg-muted text-muted-foreground border-border'}
                  `}>
                    #{idx + 1}
                  </div>

                  <div className="h-12 w-16 rounded-xl overflow-hidden bg-muted border border-border/70 shrink-0">
                    {tour.heroImage ? (
                      <img src={tour.heroImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Link href={`/${locale}/admin/tours/${tour.slug}`} className="hover:text-primary transition-colors">
                        {tour.titleJsonb?.en || tour.titleJsonb?.ar || tour.slug}
                      </Link>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold bg-background/80">
                        {tour.category}
                      </Badge>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          🔥 {isRtl ? "الأكثر طلباً" : "Top Seller"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">/{tour.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="text-right">
                    <div className="font-extrabold font-mono text-amber-400 text-sm">${tour.totalRevenue.toLocaleString()} USD</div>
                    <div className="text-[10px] text-muted-foreground">{tour.confirmedBookings} {isRtl ? "حجز مؤكد" : "Bookings"}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-foreground">{tour.occupancyRate}% {isRtl ? "إشغال" : "Occupancy"}</div>
                    <div className="text-[10px] text-muted-foreground">{tour.occupiedSeats} / {tour.capacity} {isRtl ? "مقعد" : "Seats"}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/${locale}/admin/tours/${tour.slug}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" title="View Specs">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-500" title="Edit Tour">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-emerald-500" title="Visitor Preview">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
