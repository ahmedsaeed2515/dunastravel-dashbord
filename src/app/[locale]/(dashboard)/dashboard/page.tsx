"use client";

import { useState } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { ActionCenter } from "@/features/dashboard/components/ActionCenter";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { RecentBookingsTable } from "@/features/dashboard/components/RecentBookingsTable";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { PopularToursSection } from "@/features/dashboard/components/PopularToursSection";
import {
  useDashboardSummary, 
  useRevenueTrend,
  useActionCenter,
  useRecentBookings, 
  useRecentActivity
} from "@/features/dashboard/hooks/useDashboardData";
import { DashboardFilters } from "@/features/dashboard/types";

export default function GeneralDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ preset: "all" });

  const { 
    data: summary, 
    isLoading: isLoadingSummary, 
    refetch: refetchSummary, 
    isRefetching: isRefetchingSummary 
  } = useDashboardSummary(filters);

  const { 
    data: revenueTrend, 
    isLoading: isLoadingRevenue,
    refetch: refetchRevenue 
  } = useRevenueTrend(filters);

  const { 
    data: actionAlerts, 
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts 
  } = useActionCenter(filters);

  const { 
    data: recentBookings, 
    isLoading: isLoadingRecentBookings,
    refetch: refetchBookings 
  } = useRecentBookings();

  const { 
    data: recentActivity, 
    isLoading: isLoadingActivity,
    refetch: refetchActivity 
  } = useRecentActivity();

  const handleRefreshAll = () => {
    refetchSummary();
    refetchRevenue();
    refetchAlerts();
    refetchBookings();
    refetchActivity();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Executive Operational Header with Period Selector & CTAs */}
      <DashboardHeader
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetchingSummary}
      />

      {/* 2. Core Executive Financial & Operational KPI Strip (4 Cards) */}
      <KPIGrid data={summary} isLoading={isLoadingSummary} />

      {/* 3. Operational Attention & Exceptions Center */}
      <ActionCenter alerts={actionAlerts} isLoading={isLoadingAlerts} />

      {/* 4. Financial & Revenue Analytics + Real Destination Share */}
      <AnalyticsCharts
        filters={filters}
        revenueTrend={revenueTrend}
        isLoadingRevenue={isLoadingRevenue}
      />

      {/* 5. Live Operations Bookings Feed (8 cols) + Humanized Audit Stream (4 cols) */}
      <div className="grid gap-5 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <RecentBookingsTable 
            bookings={recentBookings} 
            isLoading={isLoadingRecentBookings} 
          />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityFeed 
            activities={recentActivity} 
            isLoading={isLoadingActivity} 
          />
        </div>
      </div>

      {/* 6. Ranked High-Demand Tour Performance (Real Database Records) */}
      <PopularToursSection filters={filters} />
    </div>
  );
}
