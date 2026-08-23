import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationsApi } from "../api/communicationsApi";
import {
  ContactSubmissionQueryFilters,
  CreateEmailTemplatePayload,
  InquiryQueryFilters,
  NotificationDeliveryLogQueryFilters,
  UpdateEmailTemplatePayload,
  UpdateInquiryPayload,
} from "../types";
import { toast } from "sonner";

export const communicationsKeys = {
  all: ["communications"] as const,
  metrics: () => [...communicationsKeys.all, "metrics"] as const,
  logs: (filters: NotificationDeliveryLogQueryFilters) => [...communicationsKeys.all, "logs", filters] as const,
  inquiries: (filters: InquiryQueryFilters) => [...communicationsKeys.all, "inquiries", filters] as const,
  inquiry: (referenceCode: string) => [...communicationsKeys.all, "inquiry", referenceCode] as const,
  templates: () => [...communicationsKeys.all, "templates"] as const,
  contactSubmissions: (filters: ContactSubmissionQueryFilters) => [...communicationsKeys.all, "contactSubmissions", filters] as const,
};

export function useCommunicationMetrics() {
  return useQuery({
    queryKey: communicationsKeys.metrics(),
    queryFn: () => communicationsApi.getMetrics(),
    refetchInterval: 30000, // Refresh metrics every 30 seconds
  });
}

export function useDeliveryLogs(filters: NotificationDeliveryLogQueryFilters) {
  return useQuery({
    queryKey: communicationsKeys.logs(filters),
    queryFn: () => communicationsApi.getLogs(filters),
    placeholderData: (prev) => prev,
    refetchInterval: 15000, // Poll logs to see status changes easily
  });
}

export function useRetryNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationsApi.retryNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationsKeys.all });
      toast.success("Retry initiated. A new delivery attempt has started.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate retry.");
    },
  });
}

export function useInquiries(filters: InquiryQueryFilters) {
  return useQuery({
    queryKey: communicationsKeys.inquiries(filters),
    queryFn: () => communicationsApi.getInquiries(filters),
    placeholderData: (prev) => prev,
  });
}

export function useInquiry(referenceCode: string, enabled = true) {
  return useQuery({
    queryKey: communicationsKeys.inquiry(referenceCode),
    queryFn: () => communicationsApi.getInquiry(referenceCode),
    enabled: enabled && Boolean(referenceCode),
  });
}

export function useAssignInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, assigneeId }: { referenceCode: string, assigneeId: string }) => 
      communicationsApi.updateInquiry(referenceCode, { assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", "inquiries"] });
      toast.success("Inquiry assigned successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to assign inquiry.");
    },
  });
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, payload }: { referenceCode: string; payload: UpdateInquiryPayload }) =>
      communicationsApi.updateInquiry(referenceCode, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communications", "inquiries"] });
      queryClient.invalidateQueries({ queryKey: communicationsKeys.inquiry(variables.referenceCode) });
      toast.success("Inquiry updated successfully.");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update inquiry."),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: communicationsKeys.templates(),
    queryFn: () => communicationsApi.getTemplates(),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmailTemplatePayload) => communicationsApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationsKeys.templates() });
      toast.success("Template created successfully.");
    },
    onError: () => toast.error("Failed to create template."),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplatePayload }) => communicationsApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationsKeys.templates() });
      toast.success("Template updated successfully.");
    },
    onError: () => toast.error("Failed to update template."),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationsKeys.templates() });
      toast.success("Template deleted successfully.");
    },
    onError: () => toast.error("Failed to delete template."),
  });
}

export function useContactSubmissions(filters: ContactSubmissionQueryFilters) {
  return useQuery({
    queryKey: communicationsKeys.contactSubmissions(filters),
    queryFn: () => communicationsApi.getContactSubmissions(filters),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateContactSubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, status }: { referenceCode: string, status: string }) => 
      communicationsApi.updateContactSubmissionStatus(referenceCode, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", "contactSubmissions"] });
      toast.success("Submission status updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update submission status.");
    },
  });
}
