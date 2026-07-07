import { apiClient } from "@/lib/axios";

export const reportsApi = {
  getBookingsTrend: async (period: string = 'monthly'): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/admin/reports/bookings-trend", { params: { period } });
    return response as any;
  }
};
