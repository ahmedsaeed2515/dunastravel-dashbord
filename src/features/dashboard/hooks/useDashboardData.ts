import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { DashboardFilters } from "../types";

const QUERY_CONFIG_METRICS = {
  staleTime: 60000,
  gcTime: 300000,
  refetchOnWindowFocus: false,
};

const QUERY_CONFIG_FEED = {
  staleTime: 30000,
  gcTime: 180000,
  refetchOnWindowFocus: false,
};

export function useDashboardSummary(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () => dashboardApi.getSummary(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useRevenueTrend(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", filters],
    queryFn: () => dashboardApi.getRevenueTrend(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useBookingsTrend(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "bookings-trend", filters],
    queryFn: () => dashboardApi.getBookingsTrend(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useTopDestinations(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "top-destinations", filters],
    queryFn: () => dashboardApi.getTopDestinations(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useTourPerformance(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "tour-performance", filters],
    queryFn: () => dashboardApi.getTourPerformance(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useInterfacePerformance(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "interface-performance", filters],
    queryFn: () => dashboardApi.getInterfacePerformance(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useConversionFunnel(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "conversion-funnel", filters],
    queryFn: () => dashboardApi.getConversionFunnel(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useTrafficAnalytics(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "traffic", filters],
    queryFn: () => dashboardApi.getTrafficAnalytics(filters),
    ...QUERY_CONFIG_METRICS,
  });
}

export function useActionCenter(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "action-center", filters],
    queryFn: () => dashboardApi.getActionCenter(filters),
    ...QUERY_CONFIG_FEED,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ["dashboard", "recent-bookings"],
    queryFn: () => dashboardApi.getRecentBookings(),
    ...QUERY_CONFIG_FEED,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => dashboardApi.getRecentActivity(),
    ...QUERY_CONFIG_FEED,
  });
}
