import { apiClient } from "@/lib/axios";
import {
  DashboardFilters, ExecutiveSummary, RevenueTrendItem, BookingsTrendItem,
  TourPerformanceItem, TourRankings, InterfacePerformanceItem, ConversionFunnelData,
  ActionAlert, RecentBookingItem, RecentActivityItem
} from "../types";

export const dashboardApi = {
  getOverview: async (filters?: DashboardFilters): Promise<{
    summary: ExecutiveSummary;
    revenueTrend: RevenueTrendItem[];
    bookingsTrend: BookingsTrendItem[];
    tourPerformance: { all: TourPerformanceItem[]; rankings: TourRankings };
    actionCenter: ActionAlert[];
    recentBookings: RecentBookingItem[];
    recentActivity: RecentActivityItem[];
  }> => {
    const res: any = await apiClient.get("/admin/dashboard/overview", { params: filters });
    return res?.data ?? res;
  },

  getSummary: async (filters?: DashboardFilters): Promise<ExecutiveSummary> => {
    const res: any = await apiClient.get("/admin/dashboard/summary", { params: filters });
    return res?.data ?? res;
  },

  getRevenueTrend: async (filters?: DashboardFilters): Promise<RevenueTrendItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/revenue-trend", { params: filters });
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getBookingsTrend: async (filters?: DashboardFilters): Promise<BookingsTrendItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/bookings-trend", { params: filters });
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getTourPerformance: async (filters?: DashboardFilters): Promise<{ all: TourPerformanceItem[]; rankings: TourRankings }> => {
    const res: any = await apiClient.get("/admin/dashboard/tour-performance", { params: filters });
    return res?.data ?? res;
  },

  getTopDestinations: async (filters?: DashboardFilters): Promise<TopDestinationItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/top-destinations", { params: filters });
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getInterfacePerformance: async (filters?: DashboardFilters): Promise<InterfacePerformanceItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/interface-performance", { params: filters });
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getConversionFunnel: async (filters?: DashboardFilters): Promise<ConversionFunnelData> => {
    const res: any = await apiClient.get("/admin/dashboard/conversion-funnel", { params: filters });
    return res?.data ?? res;
  },

  getTrafficAnalytics: async (filters?: DashboardFilters): Promise<any> => {
    const res: any = await apiClient.get("/admin/dashboard/traffic", { params: filters });
    return res?.data ?? res;
  },

  getActionCenter: async (filters?: DashboardFilters): Promise<ActionAlert[]> => {
    const res: any = await apiClient.get("/admin/dashboard/action-center", { params: filters });
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getRecentBookings: async (): Promise<RecentBookingItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/recent-bookings");
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/recent-activity");
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
};
