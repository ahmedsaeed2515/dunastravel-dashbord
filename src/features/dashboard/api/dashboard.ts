import { apiClient } from "@/lib/axios";
import {
  DashboardFilters, ExecutiveSummary, RevenueTrendItem, BookingsTrendItem,
  TourPerformanceItem, TourRankings, InterfacePerformanceItem, ConversionFunnelData,
  ActionAlert, RecentBookingItem, RecentActivityItem
} from "../types";

export const dashboardApi = {
  getSummary: async (filters?: DashboardFilters): Promise<ExecutiveSummary> => {
    const response = await apiClient.get<ExecutiveSummary>("/admin/dashboard/summary", { params: filters });
    return response as any;
  },

  getRevenueTrend: async (filters?: DashboardFilters): Promise<RevenueTrendItem[]> => {
    const response = await apiClient.get<RevenueTrendItem[]>("/admin/dashboard/revenue-trend", { params: filters });
    return response as any;
  },

  getBookingsTrend: async (filters?: DashboardFilters): Promise<BookingsTrendItem[]> => {
    const response = await apiClient.get<BookingsTrendItem[]>("/admin/dashboard/bookings-trend", { params: filters });
    return response as any;
  },

  getTourPerformance: async (filters?: DashboardFilters): Promise<{ all: TourPerformanceItem[]; rankings: TourRankings }> => {
    const response = await apiClient.get<{ all: TourPerformanceItem[]; rankings: TourRankings }>("/admin/dashboard/tour-performance", { params: filters });
    return response as any;
  },

  getInterfacePerformance: async (filters?: DashboardFilters): Promise<InterfacePerformanceItem[]> => {
    const response = await apiClient.get<InterfacePerformanceItem[]>("/admin/dashboard/interface-performance", { params: filters });
    return response as any;
  },

  getConversionFunnel: async (filters?: DashboardFilters): Promise<ConversionFunnelData> => {
    const response = await apiClient.get<ConversionFunnelData>("/admin/dashboard/conversion-funnel", { params: filters });
    return response as any;
  },

  getTrafficAnalytics: async (filters?: DashboardFilters): Promise<any> => {
    const response = await apiClient.get<any>("/admin/dashboard/traffic", { params: filters });
    return response as any;
  },

  getActionCenter: async (filters?: DashboardFilters): Promise<ActionAlert[]> => {
    const response = await apiClient.get<ActionAlert[]>("/admin/dashboard/action-center", { params: filters });
    return response as any;
  },

  getRecentBookings: async (): Promise<RecentBookingItem[]> => {
    const response = await apiClient.get<RecentBookingItem[]>("/admin/dashboard/recent-bookings");
    return response as any;
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    const response = await apiClient.get<RecentActivityItem[]>("/admin/dashboard/recent-activity");
    return response as any;
  },
};
