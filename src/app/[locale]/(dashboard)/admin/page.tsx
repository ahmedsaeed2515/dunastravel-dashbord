"use client";

import { useState } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { ActionCenter } from "@/features/dashboard/components/ActionCenter";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { ConversionFunnelCard } from "@/features/dashboard/components/ConversionFunnelCard";
import { TrafficAnalyticsCard } from "@/features/dashboard/components/TrafficAnalyticsCard";
import { ToursPerformanceSection } from "@/features/dashboard/components/ToursPerformanceSection";
import { InterfacePerformanceSection } from "@/features/dashboard/components/InterfacePerformanceSection";
import { RecentBookingsTable } from "@/features/dashboard/components/RecentBookingsTable";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import {
  useDashboardSummary, useRevenueTrend, useBookingsTrend,
  useTourPerformance, useInterfacePerformance, useConversionFunnel,
  useTrafficAnalytics, useActionCenter, useRecentBookings, useRecentActivity
} from "@/features/dashboard/hooks/useDashboardData";
import { DashboardFilters } from "@/features/dashboard/types";

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary, isRefetching: isRefetchingSummary } = useDashboardSummary(filters);
  const { data: revenueTrend, isLoading: isLoadingRevenue } = useRevenueTrend(filters);
  const { data: bookingsTrend, isLoading: isLoadingBookings } = useBookingsTrend(filters);
  const { data: tourPerformance, isLoading: isLoadingTours } = useTourPerformance(filters);
  const { data: interfacePerformance, isLoading: isLoadingInterfaces } = useInterfacePerformance(filters);
  const { data: conversionFunnel, isLoading: isLoadingFunnel } = useConversionFunnel(filters);
  const { data: trafficData, isLoading: isLoadingTraffic } = useTrafficAnalytics(filters);
  const { data: actionAlerts, isLoading: isLoadingAlerts } = useActionCenter(filters);
  const { data: recentBookings, isLoading: isLoadingRecentBookings } = useRecentBookings();
  const { data: recentActivity, isLoading: isLoadingActivity } = useRecentActivity();

  const handleRefreshAll = () => {
    refetchSummary();
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Global Header & Filter Bar */}
      <DashboardHeader
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetchingSummary}
      />

      {/* 2. Executive KPIs Section */}
      <KPIGrid data={summary} isLoading={isLoadingSummary} />

      {/* 3. Operational Action Center Alerts */}
      <ActionCenter alerts={actionAlerts} isLoading={isLoadingAlerts} />

      {/* 4. Financial & Revenue Analytics */}
      <AnalyticsCharts
        revenueTrend={revenueTrend}
        bookingsTrend={bookingsTrend}
        isLoadingRevenue={isLoadingRevenue}
        isLoadingBookings={isLoadingBookings}
      />

      {/* 5. Website Visitor Funnel & Device Traffic */}
      <div className="grid gap-6 md:grid-cols-2">
        <ConversionFunnelCard data={conversionFunnel} isLoading={isLoadingFunnel} />
        <TrafficAnalyticsCard data={trafficData} isLoading={isLoadingTraffic} />
      </div>

      {/* 6. Tours Performance Section */}
      <ToursPerformanceSection rankings={tourPerformance?.rankings} isLoading={isLoadingTours} />

      {/* 7. Tour Interfaces Performance (All ~9 Landing Pages) */}
      <InterfacePerformanceSection interfaces={interfacePerformance} isLoading={isLoadingInterfaces} />

      {/* 8. Recent Bookings Table & System Audit Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={recentBookings} isLoading={isLoadingRecentBookings} />
        </div>
        <div>
          <RecentActivityFeed activities={recentActivity} isLoading={isLoadingActivity} />
        </div>
      </div>
    </div>
  );
}
