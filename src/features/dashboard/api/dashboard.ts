import { apiClient } from "@/lib/axios";
import {
  ActionAlert,
  BookingsTrendItem,
  ConversionFunnelData,
  DashboardFilters,
  ExecutiveSummary,
  InterfacePerformanceItem,
  RecentActivityItem,
  RecentBookingItem,
  RevenueTrendItem,
  RevenueTrendResponse,
  TopDestinationItem,
  TourPerformanceItem,
  TourRankings,
} from "../types";

export interface TrafficAnalytics {
  devices: Array<{ device: string; count: number; percent: number }>;
  sources: Array<{ source: string; count: number }>;
}

/** Dashboard metrics are backend aggregates; successful zeros and empties are preserved. */
export const dashboardApi = {
  getSummary: (filters?: DashboardFilters): Promise<ExecutiveSummary> =>
    apiClient.get<unknown, ExecutiveSummary>('/admin/dashboard/summary', { params: filters }),
  getRevenueTrend: (filters?: DashboardFilters): Promise<RevenueTrendResponse | RevenueTrendItem[]> =>
    apiClient.get<unknown, RevenueTrendResponse | RevenueTrendItem[]>('/admin/dashboard/revenue-trend', { params: filters }),
  getBookingsTrend: (filters?: DashboardFilters): Promise<BookingsTrendItem[]> =>
    apiClient.get<unknown, BookingsTrendItem[]>('/admin/dashboard/bookings-trend', { params: filters }),
  getTopDestinations: (filters?: DashboardFilters): Promise<TopDestinationItem[]> =>
    apiClient.get<unknown, TopDestinationItem[]>('/admin/dashboard/top-destinations', { params: filters }),
  getTourPerformance: (filters?: DashboardFilters): Promise<{ all: TourPerformanceItem[]; rankings: TourRankings }> =>
    apiClient.get<unknown, { all: TourPerformanceItem[]; rankings: TourRankings }>('/admin/dashboard/tour-performance', { params: filters }),
  getInterfacePerformance: (filters?: DashboardFilters): Promise<InterfacePerformanceItem[]> =>
    apiClient.get<unknown, InterfacePerformanceItem[]>('/admin/dashboard/interface-performance', { params: filters }),
  getConversionFunnel: (filters?: DashboardFilters): Promise<ConversionFunnelData> =>
    apiClient.get<unknown, ConversionFunnelData>('/admin/dashboard/conversion-funnel', { params: filters }),
  getTrafficAnalytics: (filters?: DashboardFilters): Promise<TrafficAnalytics> =>
    apiClient.get<unknown, TrafficAnalytics>('/admin/dashboard/traffic', { params: filters }),
  getActionCenter: (filters?: DashboardFilters): Promise<ActionAlert[]> =>
    apiClient.get<unknown, ActionAlert[]>('/admin/dashboard/action-center', { params: filters }),
  getRecentBookings: (): Promise<RecentBookingItem[]> =>
    apiClient.get<unknown, RecentBookingItem[]>('/admin/dashboard/recent-bookings'),
  getRecentActivity: (): Promise<RecentActivityItem[]> =>
    apiClient.get<unknown, RecentActivityItem[]>('/admin/dashboard/recent-activity'),
};
