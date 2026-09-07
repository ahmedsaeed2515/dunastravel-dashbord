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

  exportCsv: async (filters: CompanyQueryFilters): Promise<Blob> => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params[k] = String(v);
    });
    const res = await apiClient.get('/admin/companies/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data as Blob;
  },

  exportCompaniesCsv: async (filters: CompanyQueryFilters): Promise<Blob> => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params[k] = String(v);
    });
    const res = await apiClient.get('/admin/companies/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data as Blob;
  }
};
