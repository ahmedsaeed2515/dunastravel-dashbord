import { useQuery } from "@tanstack/react-query";
import { ReportPeriod, reportsApi } from "../api/reportsApi";

export function useBookingsTrend(period: ReportPeriod = 'monthly') {
  return useQuery({
    queryKey: ["reports", "bookings-trend", period],
    queryFn: () => reportsApi.getBookingsTrend(period),
  });
}

export function useRevenueReport(period: ReportPeriod = 'monthly') {
  return useQuery({
    queryKey: ["reports", "revenue", period],
    queryFn: () => reportsApi.getRevenue(period),
  });
}

export function useDestinationsReport() {
  return useQuery({
    queryKey: ["reports", "destinations"],
    queryFn: () => reportsApi.getDestinations(),
  });
}
