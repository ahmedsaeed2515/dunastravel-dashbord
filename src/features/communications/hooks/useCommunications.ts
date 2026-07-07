import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationsApi } from "../api/communicationsApi";
import { NotificationDeliveryLogQueryFilters } from "../types";
import { toast } from "sonner";

export const communicationsKeys = {
  all: ["communications"] as const,
  metrics: () => [...communicationsKeys.all, "metrics"] as const,
  logs: (filters: NotificationDeliveryLogQueryFilters) => [...communicationsKeys.all, "logs", filters] as const,
  inquiries: (filters: any) => [...communicationsKeys.all, "inquiries", filters] as const,
  templates: () => [...communicationsKeys.all, "templates"] as const,
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

export function useInquiries(filters: any) {
  return useQuery({
    queryKey: communicationsKeys.inquiries(filters),
    queryFn: () => communicationsApi.getInquiries(filters),
    placeholderData: (prev) => prev,
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

export function useTemplates() {
  return useQuery({
    queryKey: communicationsKeys.templates(),
    queryFn: () => communicationsApi.getTemplates(),
  });
}
