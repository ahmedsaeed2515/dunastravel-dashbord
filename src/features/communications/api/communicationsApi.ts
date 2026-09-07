import { apiClient } from "@/lib/axios";
import { 
  NotificationDeliveryLog, 
  CommunicationMetrics, 
  InquiryMetrics,
  NotificationDeliveryLogQueryFilters, 
  PaginatedResponse,
  Inquiry,
  InquiryQueryFilters,
  ContactSubmission,
  ContactSubmissionQueryFilters,
  EmailTemplate,
  CreateEmailTemplatePayload,
  UpdateEmailTemplatePayload,
} from "../types";

export const communicationsApi = {
  getMetrics: async (): Promise<CommunicationMetrics> => {
    return apiClient.get<CommunicationMetrics, CommunicationMetrics>("/admin/communications/logs/metrics");
  },

  getInquiryMetrics: async (): Promise<InquiryMetrics> => {
    return apiClient.get<InquiryMetrics, InquiryMetrics>("/admin/inquiries/metrics");
  },

  getLogs: async (filters: NotificationDeliveryLogQueryFilters): Promise<PaginatedResponse<NotificationDeliveryLog>> => {
    return apiClient.get<PaginatedResponse<NotificationDeliveryLog>, PaginatedResponse<NotificationDeliveryLog>>("/admin/notification-logs", { params: filters });
  },

  retryNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }, { success: boolean; message: string }>(`/admin/communications/logs/${id}/retry`);
  },

  getInquiries: async (filters: InquiryQueryFilters): Promise<PaginatedResponse<Inquiry>> => {
    return apiClient.get<unknown, PaginatedResponse<Inquiry>>("/admin/inquiries", { params: filters });
  },

  updateInquiry: async (
    referenceCode: string,
    payload: {
      assigneeId?: string | null;
      status?: string;
      quotedAmountUsd?: number;
      internalNote?: string;
      followUpAt?: string;
      notes?: string;
    }
  ): Promise<Inquiry> => {
    return apiClient.patch<unknown, Inquiry>(`/admin/inquiries/${referenceCode}`, payload);
  },

  convertInquiryToBooking: async (
    referenceCode: string,
    payload?: {
      tourId?: string;
      quotedAmountUsd?: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; booking: any }> => {
    return apiClient.post<unknown, { success: boolean; message: string; booking: any }>(
      `/admin/inquiries/${referenceCode}/convert-to-booking`,
      payload || {}
    );
  },

  getContactSubmissions: async (filters: ContactSubmissionQueryFilters): Promise<PaginatedResponse<ContactSubmission>> => {
    return apiClient.get<unknown, PaginatedResponse<ContactSubmission>>("/admin/contact-submissions", { params: filters });
  },

  getContactSubmissionByCode: async (referenceCode: string): Promise<ContactSubmission> => {
    return apiClient.get<unknown, ContactSubmission>(`/admin/contact-submissions/${referenceCode}`);
  },

  updateContactSubmissionStatus: async (referenceCode: string, status: string): Promise<ContactSubmission> => {
    return apiClient.patch<unknown, ContactSubmission>(`/admin/contact-submissions/${referenceCode}/status`, { status });
  },

  getTemplates: async (): Promise<EmailTemplate[]> => {
    return apiClient.get<unknown, EmailTemplate[]>("/admin/communications/templates");
  },

  getTemplateById: async (id: string): Promise<EmailTemplate> => {
    return apiClient.get<unknown, EmailTemplate>(`/admin/communications/templates/${id}`);
  },

  createTemplate: async (payload: CreateEmailTemplatePayload): Promise<EmailTemplate> => {
    return apiClient.post<unknown, EmailTemplate>("/admin/communications/templates", payload);
  },

  updateTemplate: async (id: string, payload: UpdateEmailTemplatePayload): Promise<EmailTemplate> => {
    return apiClient.patch<unknown, EmailTemplate>(`/admin/communications/templates/${id}`, payload);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/communications/templates/${id}`);
  }
};
