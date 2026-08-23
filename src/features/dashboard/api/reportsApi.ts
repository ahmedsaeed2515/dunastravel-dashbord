import { apiClient } from "@/lib/axios";

export interface DestinationReportItem {
  location: string;
  country: string | null;
  city: string | null;
  bookingCount: number;
  tourCount: number;
}

function requireArray<T>(value: unknown, reportName: string): T[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${reportName} report response`);
  return value as T[];
}

export const reportsApi = {
  getBookingsTrend: async (period: string = 'monthly'): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/bookings-trend", { params: { period } });
    return requireArray(response, "bookings trend");
  },
  
  getRevenue: async (period: string = 'monthly'): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/revenue", { params: { period } });
    return requireArray(response, "revenue");
  },

  getDestinations: async (): Promise<DestinationReportItem[]> => {
    const response = await apiClient.get<DestinationReportItem[]>("/admin/reports/destinations");
    return requireArray<DestinationReportItem>(response, "destinations");
  }
};
