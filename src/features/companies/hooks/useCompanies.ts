import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "../api/companiesApi";
import { CompanyQueryFilters, CompanyStatus, CreateCompanyPayload, UpdateCompanyPayload } from "../types";
import { toast } from "sonner";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: CompanyQueryFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  metrics: () => [...companyKeys.all, "metrics"] as const,
};

export function useCompanyMetrics() {
  return useQuery({
    queryKey: companyKeys.metrics(),
    queryFn: () => companiesApi.getMetrics(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useCompanies(filters: CompanyQueryFilters) {
  return useQuery({
    queryKey: companyKeys.list(filters),
    queryFn: () => companiesApi.getCompanies(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCompany(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getCompanyById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyPayload) => companiesApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.metrics() });
      toast.success("B2B Company created successfully.");
    },
    onError: () => toast.error("Failed to create company."),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyPayload }) => companiesApi.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.metrics() });
      toast.success("Company updated successfully.");
    },
    onError: () => toast.error("Failed to update company."),
  });
}

export function useBulkUpdateCompanies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { companyIds: string[]; status?: CompanyStatus; tags?: string[]; segments?: string[] }) => companiesApi.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.metrics() });
      toast.success("Bulk update applied successfully.");
    },
    onError: () => toast.error("Failed to apply bulk update."),
  });
}
