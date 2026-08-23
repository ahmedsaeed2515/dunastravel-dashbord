import { apiClient } from "@/lib/axios";
import {
  DashboardFilters, ExecutiveSummary, RevenueTrendItem, BookingsTrendItem,
  TopDestinationItem, TourPerformanceItem, TourRankings, InterfacePerformanceItem, ConversionFunnelData,
  ActionAlert, RecentBookingItem, RecentActivityItem
} from "../types";

function unwrapObject<T>(response: unknown, name: string): T {
  const value = response && typeof response === "object" && "data" in response
    ? (response as { data: unknown }).data
    : response;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${name} response`);
  return value as T;
}

function unwrapArray<T>(response: unknown, name: string): T[] {
  const value = response && typeof response === "object" && "data" in response
    ? (response as { data: unknown }).data
    : response;
  if (!Array.isArray(value)) throw new Error(`Invalid ${name} response`);
  return value as T[];
}

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
    return unwrapObject(res, "dashboard overview");
  },

  getSummary: async (filters?: DashboardFilters): Promise<ExecutiveSummary> => {
    const res: any = await apiClient.get("/admin/dashboard/summary", { params: filters });
    return unwrapObject(res, "dashboard summary");
  },

  getRevenueTrend: async (filters?: DashboardFilters): Promise<RevenueTrendItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/revenue-trend", { params: filters });
    return unwrapArray(res, "revenue trend");
  },

  getBookingsTrend: async (filters?: DashboardFilters): Promise<BookingsTrendItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/bookings-trend", { params: filters });
    return unwrapArray(res, "bookings trend");
  },

  getTourPerformance: async (filters?: DashboardFilters): Promise<{ all: TourPerformanceItem[]; rankings: TourRankings }> => {
    const res: any = await apiClient.get("/admin/dashboard/tour-performance", { params: filters });
    return unwrapObject(res, "tour performance");
  },

  getTopDestinations: async (filters?: DashboardFilters): Promise<TopDestinationItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/top-destinations", { params: filters });
    return unwrapArray(res, "top destinations");
  },

  getInterfacePerformance: async (filters?: DashboardFilters): Promise<InterfacePerformanceItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/interface-performance", { params: filters });
    return unwrapArray(res, "interface performance");
  },

  getConversionFunnel: async (filters?: DashboardFilters): Promise<ConversionFunnelData> => {
    const res: any = await apiClient.get("/admin/dashboard/conversion-funnel", { params: filters });
    return unwrapObject(res, "conversion funnel");
  },

  getTrafficAnalytics: async (filters?: DashboardFilters): Promise<any> => {
    const res: any = await apiClient.get("/admin/dashboard/traffic", { params: filters });
    return unwrapObject(res, "traffic analytics");
  },

  getActionCenter: async (filters?: DashboardFilters): Promise<ActionAlert[]> => {
    const res: any = await apiClient.get("/admin/dashboard/action-center", { params: filters });
    return unwrapArray(res, "action center");
  },

  getRecentBookings: async (): Promise<RecentBookingItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/recent-bookings");
    return unwrapArray(res, "recent bookings");
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    const res: any = await apiClient.get("/admin/dashboard/recent-activity");
    return unwrapArray(res, "recent activity");
  },
};
