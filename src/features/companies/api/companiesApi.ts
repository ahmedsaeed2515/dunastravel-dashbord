import { apiClient } from "@/lib/axios";
import { env } from "@/config/env";
import { 
  Company, 
  CompanyDetail, 
  CompanyMetrics, 
  CompanyQueryFilters, 
  CreateCompanyPayload, 
  UpdateCompanyPayload 
} from "../types";
import { PaginatedResponse } from "@/lib/api-types";

export const companiesApi = {
  getMetrics: async (): Promise<CompanyMetrics> => {
    return apiClient.get<CompanyMetrics, CompanyMetrics>("/admin/companies/metrics");
  },

  getCompanies: async (filters: CompanyQueryFilters): Promise<PaginatedResponse<Company>> => {
    return apiClient.get<PaginatedResponse<Company>, PaginatedResponse<Company>>("/admin/companies", { params: filters });
  },

  getCompanyById: async (id: string): Promise<CompanyDetail> => {
    return apiClient.get<CompanyDetail, CompanyDetail>(`/admin/companies/${id}`);
  },

  createCompany: async (payload: CreateCompanyPayload): Promise<Company> => {
    return apiClient.post<Company, Company>("/admin/companies", payload);
  },

  updateCompany: async (id: string, payload: UpdateCompanyPayload): Promise<Company> => {
    return apiClient.patch<Company, Company>(`/admin/companies/${id}`, payload);
  },

  bulkUpdate: async (payload: { companyIds: string[]; status?: string; tags?: string[]; segments?: string[] }): Promise<{ count: number }> => {
    return apiClient.patch<{ count: number }, { count: number }>("/admin/companies/bulk/update", payload);
  },

  exportCompaniesCsv: async (filters: CompanyQueryFilters): Promise<Blob> => {
    const csv = await apiClient.get<string, string>("/admin/companies/export/csv", { params: filters });
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  },

  exportCsvUrl: (filters: CompanyQueryFilters): string => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return `${env.NEXT_PUBLIC_API_URL}/admin/companies/export/csv?${params}`;
  }
};
