import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { DashboardFilters } from "../types";

export function useDashboardSummary(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () => dashboardApi.getSummary(filters),
    staleTime: 60000,
  });
}

export function useRevenueTrend(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", filters],
    queryFn: () => dashboardApi.getRevenueTrend(filters),
    staleTime: 60000,
  });
}

export function useBookingsTrend(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "bookings-trend", filters],
    queryFn: () => dashboardApi.getBookingsTrend(filters),
    staleTime: 60000,
  });
}

export function useTopDestinations(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "top-destinations", filters],
    queryFn: () => dashboardApi.getTopDestinations(filters),
    staleTime: 60000,
  });
}

export function useTourPerformance(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "tour-performance", filters],
    queryFn: () => dashboardApi.getTourPerformance(filters),
    staleTime: 60000,
  });
}

export function useInterfacePerformance(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "interface-performance", filters],
    queryFn: () => dashboardApi.getInterfacePerformance(filters),
    staleTime: 60000,
  });
}

export function useConversionFunnel(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "conversion-funnel", filters],
    queryFn: () => dashboardApi.getConversionFunnel(filters),
    staleTime: 60000,
  });
}

export function useTrafficAnalytics(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "traffic", filters],
    queryFn: () => dashboardApi.getTrafficAnalytics(filters),
    staleTime: 60000,
  });
}

export function useActionCenter(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "action-center", filters],
    queryFn: () => dashboardApi.getActionCenter(filters),
    staleTime: 30000,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ["dashboard", "recent-bookings"],
    queryFn: () => dashboardApi.getRecentBookings(),
    staleTime: 30000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => dashboardApi.getRecentActivity(),
    staleTime: 30000,
  });
}
