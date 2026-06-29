import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/customersApi";
import { 
  ListCustomersParams, 
  UpdateCustomerCrmPayload, 
  BulkUpdateCustomersPayload, 
  AddCustomerNotePayload, 
  AddCustomerDocumentPayload 
} from "../types";
import { toast } from "sonner";

export function useCustomerMetrics() {
  return useQuery({
    queryKey: ["customers", "metrics"],
    queryFn: () => customersApi.getMetrics(),
  });
}

export function useCustomers(params: ListCustomersParams) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersApi.getCustomers(params),
  });
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.getCustomerDetail(id),
    enabled: !!id,
  });
}

export function useUpdateCustomerCrm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerCrmPayload }) => customersApi.updateCustomerCrm(id, data),
    onSuccess: (data, variables) => {
      toast.success("Customer profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", "metrics"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update customer profile");
    },
  });
}

export function useBulkUpdateCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateCustomersPayload) => customersApi.bulkUpdateCustomers(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} customers successfully`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "metrics"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to bulk update customers");
    },
  });
}

export function useAddCustomerNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCustomerNotePayload }) => customersApi.addCustomerNote(id, data),
    onSuccess: (_, variables) => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add note");
    },
  });
}

export function useAddCustomerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCustomerDocumentPayload }) => customersApi.addCustomerDocument(id, data),
    onSuccess: (_, variables) => {
      toast.success("Document attached successfully");
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to attach document");
    },
  });
}
