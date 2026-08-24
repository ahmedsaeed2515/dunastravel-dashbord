import { apiClient } from "@/lib/axios";

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export interface BookingsTrendPoint { period: string; total: number; confirmed: number; pending: number; completed: number; cancelled: number; }
export interface RevenueTrendPoint { period: string; grossRevenue: number; totalRevenue: number; collectedRevenue: number; bookingsCount: number; currency: string; }
export interface DestinationReportPoint { location: string; country: string | null; city: string | null; bookingCount: number; tourCount: number; }

export const reportsApi = {
  getBookingsTrend: (period: ReportPeriod = 'monthly'): Promise<BookingsTrendPoint[]> => {
    return apiClient.get<unknown, BookingsTrendPoint[]>("/admin/reports/bookings-trend", { params: { period } });
  },
  
  getRevenue: (period: ReportPeriod = 'monthly'): Promise<RevenueTrendPoint[]> => {
    return apiClient.get<unknown, RevenueTrendPoint[]>("/admin/reports/revenue", { params: { period } });
  },

  getDestinations: (): Promise<DestinationReportPoint[]> => {
    return apiClient.get<unknown, DestinationReportPoint[]>("/admin/reports/destinations");
  }
};
