import { apiClient } from "@/lib/axios";
import { 
  NotificationDeliveryLog, 
  CommunicationMetrics, 
  NotificationDeliveryLogQueryFilters, 
  PaginatedResponse,
  Inquiry,
  UpdateInquiryPayload,
  InquiryQueryFilters,
  EmailTemplate,
  CreateEmailTemplatePayload,
  UpdateEmailTemplatePayload,
  ContactSubmission,
  ContactSubmissionQueryFilters,
} from "../types";
import { requireArray, requireObject, requirePaginated } from "@/lib/api-response";

export const communicationsApi = {
  getMetrics: async (): Promise<CommunicationMetrics> => {
    const response = await apiClient.get("/admin/communications/logs/metrics");
    return requireObject<CommunicationMetrics>(response, "communication metrics");
  },

  getLogs: async (filters: NotificationDeliveryLogQueryFilters): Promise<PaginatedResponse<NotificationDeliveryLog>> => {
    const response = await apiClient.get("/admin/notification-logs", { params: filters });
    return requirePaginated(response, "notification delivery logs");
  },

  retryNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/communications/logs/${id}/retry`);
    return requireObject(response, "notification retry");
  },

  getInquiries: async (filters: InquiryQueryFilters): Promise<PaginatedResponse<Inquiry>> => {
    const response = await apiClient.get("/admin/inquiries", { params: filters });
    return requirePaginated(response, "inquiries");
  },

  getInquiry: async (referenceCode: string): Promise<Inquiry> => {
    const response = await apiClient.get(`/admin/inquiries/${referenceCode}`);
    return requireObject(response, "inquiry detail");
  },

  updateInquiry: async (referenceCode: string, payload: UpdateInquiryPayload): Promise<Inquiry> => {
    const response = await apiClient.patch(`/admin/inquiries/${referenceCode}`, payload);
    return requireObject(response, "updated inquiry");
  },

  getContactSubmissions: async (filters: ContactSubmissionQueryFilters): Promise<PaginatedResponse<ContactSubmission>> => {
    const response = await apiClient.get("/admin/contact-submissions", { params: filters });
    return requirePaginated(response, "contact submissions");
  },

  getContactSubmissionByCode: async (referenceCode: string): Promise<ContactSubmission> => {
    const response = await apiClient.get(`/admin/contact-submissions/${referenceCode}`);
    return requireObject(response, "contact submission");
  },

  updateContactSubmissionStatus: async (referenceCode: string, status: string): Promise<ContactSubmission> => {
    const response = await apiClient.patch(`/admin/contact-submissions/${referenceCode}/status`, { status });
    return requireObject(response, "updated contact submission");
  },

  getTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get("/admin/communications/templates");
    return requireArray(response, "communication templates");
  },

  getTemplateById: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.get(`/admin/communications/templates/${id}`);
    return requireObject(response, "email template");
  },

  createTemplate: async (payload: CreateEmailTemplatePayload): Promise<EmailTemplate> => {
    const response = await apiClient.post("/admin/communications/templates", payload);
    return requireObject(response, "created email template");
  },

  updateTemplate: async (id: string, payload: UpdateEmailTemplatePayload): Promise<EmailTemplate> => {
    const response = await apiClient.patch(`/admin/communications/templates/${id}`, payload);
    return requireObject(response, "updated email template");
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/communications/templates/${id}`);
  }
};
