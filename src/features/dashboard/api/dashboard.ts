import { apiClient } from "@/lib/axios";
import { DashboardMetrics } from "../types";

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>("/admin/dashboard");
    return response as any; // apiClient interceptor returns response.data directly
  },
};
