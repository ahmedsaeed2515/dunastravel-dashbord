import { apiClient } from "@/lib/axios";

export const reportsApi = {
  getBookingsTrend: async (period: string = 'monthly'): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/bookings-trend", { params: { period } });
    return response as any;
  },
  
  getRevenue: async (period: string = 'monthly'): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/revenue", { params: { period } });
    return response as any;
  },

  getDestinations: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/destinations");
    return response as any;
  }
};
