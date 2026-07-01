import { apiClient } from "@/lib/axios";
import { 
  NotificationDeliveryLog, 
  CommunicationMetrics, 
  NotificationDeliveryLogQueryFilters, 
  PaginatedResponse 
} from "../types";

export const communicationsApi = {
  getMetrics: async (): Promise<CommunicationMetrics> => {
    const { data } = await apiClient.get("/admin/communications/logs/metrics");
    return data;
  },

  getLogs: async (filters: NotificationDeliveryLogQueryFilters): Promise<PaginatedResponse<NotificationDeliveryLog>> => {
    const { data } = await apiClient.get("/admin/communications/logs", { params: filters });
    return data;
  },

  retryNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post(`/admin/communications/logs/${id}/retry`);
    return data;
  }
};
