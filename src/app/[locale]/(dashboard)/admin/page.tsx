"use client";

import { useState } from "react";
import { WelcomeBanner } from "@/features/dashboard/components/WelcomeBanner";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { RecentBookingsTable } from "@/features/dashboard/components/RecentBookingsTable";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { PopularToursSection } from "@/features/dashboard/components/PopularToursSection";
import {
  useDashboardSummary, useRevenueTrend, useTourPerformance,
  useRecentBookings, useRecentActivity
} from "@/features/dashboard/hooks/useDashboardData";
import { DashboardFilters } from "@/features/dashboard/types";

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary, isRefetching: isRefetchingSummary } = useDashboardSummary(filters);
  const { data: revenueTrend, isLoading: isLoadingRevenue, refetch: refetchRevenue } = useRevenueTrend(filters);
  const { data: recentBookings, isLoading: isLoadingRecentBookings, refetch: refetchBookings } = useRecentBookings();
  const { data: recentActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useRecentActivity();
  const { data: tourPerformance, isLoading: isLoadingTours, isError: isToursError, refetch: refetchTours } = useTourPerformance(filters);

  const handleRefreshAll = () => {
    refetchSummary();
    refetchRevenue();
    refetchBookings();
    refetchActivity();
    refetchTours();
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 0. Welcome & Greeting Banner */}
      <WelcomeBanner />

      {/* 1. Global Header & Filter Bar */}
      <DashboardHeader
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetchingSummary}
      />

      {/* 2. Executive KPIs Section (8 Cards in 2 Equal Rows) */}
      <KPIGrid data={summary} isLoading={isLoadingSummary} />

      {/* 3. Financial & Revenue Analytics */}
      <AnalyticsCharts
        revenueTrend={revenueTrend}
        isLoadingRevenue={isLoadingRevenue}
      />

      {/* 4. Recent Bookings Table & System Audit Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={recentBookings} isLoading={isLoadingRecentBookings} />
        </div>
        <div>
          <RecentActivityFeed activities={recentActivity} isLoading={isLoadingActivity} />
        </div>
      </div>

      {/* 5. Most Popular & High-Demand Tours Section */}
      <PopularToursSection tours={tourPerformance?.rankings?.mostBooked} isLoading={isLoadingTours} isError={isToursError} />
    </div>
  );
}
