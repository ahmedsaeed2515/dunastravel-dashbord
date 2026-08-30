"use client";

import { useState, useCallback } from "react";
import { WelcomeBanner } from "@/features/dashboard/components/WelcomeBanner";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { ActionCenter } from "@/features/dashboard/components/ActionCenter";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { RecentBookingsTable } from "@/features/dashboard/components/RecentBookingsTable";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { PopularToursSection } from "@/features/dashboard/components/PopularToursSection";
import { ConversionFunnelCard } from "@/features/dashboard/components/ConversionFunnelCard";
import { TrafficAnalyticsCard } from "@/features/dashboard/components/TrafficAnalyticsCard";
import {
  useDashboardSummary,
  useRevenueTrend,
  useTopDestinations,
  useTourPerformance,
  useRecentBookings,
  useRecentActivity,
  useActionCenter,
  useConversionFunnel,
  useTrafficAnalytics,
} from "@/features/dashboard/hooks/useDashboardData";
import { DashboardFilters } from "@/features/dashboard/types";

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary, isRefetching: isRefetchingSummary } = useDashboardSummary(filters);
  const { data: revenueTrend, isLoading: isLoadingRevenue, refetch: refetchRevenue } = useRevenueTrend(filters);
  const { data: topDestinations, isLoading: isLoadingDestinations, refetch: refetchDestinations } = useTopDestinations(filters);
  const { data: actionAlerts, isLoading: isLoadingAlerts, refetch: refetchAlerts } = useActionCenter(filters);
  const { data: recentBookings, isLoading: isLoadingRecentBookings, refetch: refetchBookings } = useRecentBookings();
  const { data: recentActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useRecentActivity();
  const { data: tourPerformance, isLoading: isLoadingTours, isError: isToursError, refetch: refetchTours } = useTourPerformance(filters);
  const { data: funnelData, isLoading: isLoadingFunnel, refetch: refetchFunnel } = useConversionFunnel(filters);
  const { data: trafficData, isLoading: isLoadingTraffic, refetch: refetchTraffic } = useTrafficAnalytics(filters);

  const handleRefreshAll = useCallback(() => {
    refetchSummary();
    refetchRevenue();
    refetchDestinations();
    refetchAlerts();
    refetchBookings();
    refetchActivity();
    refetchTours();
    refetchFunnel();
    refetchTraffic();
  }, [
    refetchSummary,
    refetchRevenue,
    refetchDestinations,
    refetchAlerts,
    refetchBookings,
    refetchActivity,
    refetchTours,
    refetchFunnel,
    refetchTraffic,
  ]);

  const handleFilterChange = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 0. Welcome & Greeting Banner */}
      <WelcomeBanner />

      {/* 1. Global Header & Filter Bar */}
      <DashboardHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetchingSummary}
      />

      {/* 2. Executive KPIs Section (8 Cards in 2 Equal Rows) */}
      <KPIGrid data={summary} isLoading={isLoadingSummary} />

      {/* 3. Operational Action Center Alerts */}
      <ActionCenter alerts={actionAlerts} isLoading={isLoadingAlerts} />

      {/* 4. Financial & Revenue Analytics + Destination Breakdown */}
      <AnalyticsCharts
        revenueTrend={revenueTrend}
        topDestinations={topDestinations}
        isLoadingRevenue={isLoadingRevenue || isLoadingDestinations}
      />

      {/* 5. Website Conversion Funnel & Traffic / Device Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnelCard data={funnelData} isLoading={isLoadingFunnel} />
        <TrafficAnalyticsCard data={trafficData} isLoading={isLoadingTraffic} />
      </div>

      {/* 6. Recent Bookings Table & System Audit Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={recentBookings} isLoading={isLoadingRecentBookings} />
        </div>
        <div>
          <RecentActivityFeed activities={recentActivity} isLoading={isLoadingActivity} />
        </div>
      </div>

      {/* 7. Most Popular & High-Demand Tours Section */}
      <PopularToursSection tours={tourPerformance?.rankings?.mostBooked} isLoading={isLoadingTours} isError={isToursError} />
    </div>
  );
}
