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
    const res: any = await apiClient.get("/admin/companies/metrics");
    return res?.totalCompanies !== undefined ? res : res?.data || res;
  },

  getCompanies: async (filters: CompanyQueryFilters): Promise<PaginatedResponse<Company>> => {
    const response = await apiClient.get("/admin/companies", { params: filters });
    return response as any;
  },

  getCompanyById: async (id: string): Promise<CompanyDetail> => {
    const response = await apiClient.get(`/admin/companies/${id}`);
    return response as any;
  },

  createCompany: async (payload: CreateCompanyPayload): Promise<Company> => {
    const response = await apiClient.post("/admin/companies", payload);
    return response as any;
  },

  updateCompany: async (id: string, payload: UpdateCompanyPayload): Promise<Company> => {
    const response = await apiClient.patch(`/admin/companies/${id}`, payload);
    return response as any;
  },

  bulkUpdate: async (payload: { companyIds: string[]; status?: string; tags?: string[]; segments?: string[] }): Promise<{ count: number }> => {
    const response = await apiClient.patch("/admin/companies/bulk/update", payload);
    return response as any;
  },

  exportCsvUrl: (filters: CompanyQueryFilters): string => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return `${env.NEXT_PUBLIC_API_URL}/admin/companies/export/csv?${params}`;
  }
};
