"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TourPerformanceItem, TourRankings } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, TrendingUp, AlertTriangle, Eye, Edit, ExternalLink } from "lucide-react";

interface ToursPerformanceSectionProps {
  rankings?: TourRankings;
  isLoading?: boolean;
}

export function ToursPerformanceSection({ rankings, isLoading }: ToursPerformanceSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [activeTab, setActiveTab] = useState<"topRevenue" | "mostBooked" | "lowConversion" | "capacityAlerts">("topRevenue");

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Tours Performance Rankings Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const currentList: TourPerformanceItem[] = rankings?.[activeTab] || [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" /> Tours Performance Rankings
          </CardTitle>
          <p className="text-xs text-muted-foreground">Multi-dimensional operational tour analytics</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg border text-xs">
          <button
            onClick={() => setActiveTab("topRevenue")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === "topRevenue" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Top Revenue
          </button>
          <button
            onClick={() => setActiveTab("mostBooked")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === "mostBooked" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Most Booked
          </button>
          <button
            onClick={() => setActiveTab("lowConversion")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === "lowConversion" ? "bg-background shadow-sm text-rose-500" : "text-muted-foreground hover:text-foreground"}`}
          >
            Low Conversion Alert
          </button>
          <button
            onClick={() => setActiveTab("capacityAlerts")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${activeTab === "capacityAlerts" ? "bg-background shadow-sm text-amber-500" : "text-muted-foreground hover:text-foreground"}`}
          >
            High Capacity (&gt;80%)
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {currentList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No tours match this criteria for selected period.</div>
        ) : (
          <div className="divide-y">
            {currentList.map((tour, idx) => (
              <div key={tour.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-sm text-muted-foreground w-4 text-center">#{idx + 1}</span>
                  <div className="h-10 w-14 rounded overflow-hidden bg-muted border shrink-0">
                    {tour.heroImage ? (
                      <img src={tour.heroImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Link href={`/${locale}/admin/tours/${tour.slug}`} className="hover:underline">
                        {tour.titleJsonb?.en || tour.slug}
                      </Link>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">{tour.category}</Badge>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">/{tour.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="font-bold font-mono text-emerald-600">${tour.totalRevenue.toLocaleString()} USD</div>
                    <div className="text-[10px] text-muted-foreground">{tour.confirmedBookings} Bookings</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{tour.occupancyRate}% Occupancy</div>
                    <div className="text-[10px] text-muted-foreground">{tour.occupiedSeats} / {tour.capacity} Seats</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/${locale}/admin/tours/${tour.slug}`}>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="View Specs">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit Tour">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/admin/tours/${tour.slug}/preview`} target="_blank">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500" title="Visitor Preview">
                        <ExternalLink className="w-3.5 h-3.5" />
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
