import { apiClient } from "@/lib/axios";
import { 
  NotificationDeliveryLog, 
  CommunicationMetrics, 
  NotificationDeliveryLogQueryFilters, 
  PaginatedResponse 
} from "../types";

export const communicationsApi = {
  getMetrics: async (): Promise<CommunicationMetrics> => {
    const response = await apiClient.get("/admin/communications/logs/metrics");
    return response as any;
  },

  getLogs: async (filters: NotificationDeliveryLogQueryFilters): Promise<PaginatedResponse<NotificationDeliveryLog>> => {
    const response = await apiClient.get("/admin/notification-logs", { params: filters });
    return response as any;
  },

  retryNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/communications/logs/${id}/retry`);
    return response as any;
  },

  getInquiries: async (filters: any): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get("/admin/inquiries", { params: filters });
    return response as any;
  },

  updateInquiry: async (referenceCode: string, payload: { assigneeId?: string; status?: string }): Promise<any> => {
    const response = await apiClient.patch(`/admin/inquiries/${referenceCode}`, payload);
    return response as any;
  },

  getContactSubmissions: async (filters: any): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get("/admin/contact-submissions", { params: filters });
    return response as any;
  },

  getContactSubmissionByCode: async (referenceCode: string): Promise<any> => {
    const response = await apiClient.get(`/admin/contact-submissions/${referenceCode}`);
    return response as any;
  },

  updateContactSubmissionStatus: async (referenceCode: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/contact-submissions/${referenceCode}/status`, { status });
    return response as any;
  },

  getTemplates: async (): Promise<any[]> => {
    const response = await apiClient.get("/admin/communications/templates");
    return response as any;
  },

  getTemplateById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/admin/communications/templates/${id}`);
    return response as any;
  },

  createTemplate: async (payload: any): Promise<any> => {
    const response = await apiClient.post("/admin/communications/templates", payload);
    return response as any;
  },

  updateTemplate: async (id: string, payload: any): Promise<any> => {
    const response = await apiClient.patch(`/admin/communications/templates/${id}`, payload);
    return response as any;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/communications/templates/${id}`);
  }
};
