"use client";

import { ExecutiveSummary } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CalendarCheck, TrendingUp, TrendingDown, Percent, Users, MessageSquare, AlertTriangle } from "lucide-react";
import { CardSkeleton } from "@/components/shared/ui/Skeletons";

interface KPIGridProps {
  data?: ExecutiveSummary;
  isLoading?: boolean;
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const revenue = data?.revenue;
  const bookings = data?.bookings;
  const conversion = data?.conversion;
  const capacity = data?.capacity;
  const operational = data?.operational;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* 1. Gross Revenue */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Gross Revenue</span>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold font-mono mt-2 text-foreground">
          ${revenue?.grossRevenue?.toLocaleString() || "0"} <span className="text-xs font-normal text-muted-foreground">USD</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs">
          {(revenue?.revenueChangePercent ?? 0) >= 0 ? (
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{revenue?.revenueChangePercent}%
            </span>
          ) : (
            <span className="text-rose-500 font-semibold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> {revenue?.revenueChangePercent}%
            </span>
          )}
          <span className="text-muted-foreground">vs prev period</span>
        </div>
      </Card>

      {/* 2. Total Bookings */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total Bookings</span>
          <CalendarCheck className="w-4 h-4 text-primary" />
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">
          {bookings?.total || 0}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs">
          {(bookings?.changePercent ?? 0) >= 0 ? (
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{bookings?.changePercent}%
            </span>
          ) : (
            <span className="text-rose-500 font-semibold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> {bookings?.changePercent}%
            </span>
          )}
          <span className="text-muted-foreground">vs prev period</span>
        </div>
      </Card>

      {/* 3. Conversion Rate */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Conversion Rate</span>
          <Percent className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">
          {conversion?.rate || 0}%
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {conversion?.totalConversions || 0} confirmed / {conversion?.visitorViews || 0} views
        </div>
      </Card>

      {/* 4. Occupancy Rate */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tour Occupancy</span>
          <Users className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">
          {capacity?.occupancyRate || 0}%
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {capacity?.seatsSold || 0} sold of {capacity?.totalCapacity || 0} total seats
        </div>
      </Card>

      {/* 5. Open Inquiries */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Open Inquiries</span>
          <MessageSquare className="w-4 h-4 text-sky-500" />
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">
          {operational?.openInquiriesCount || 0}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Requires advisor follow-up
        </div>
      </Card>

      {/* 6. Active Tours */}
      <Card className="p-4 bg-card border shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Active Published Tours</span>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Live
          </Badge>
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">
          {operational?.activeToursCount || 0}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Published global products
        </div>
      </Card>
    </div>
  );
}
