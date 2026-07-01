import { apiClient } from "@/lib/axios";
import { 
  Company, 
  CompanyDetail, 
  CompanyMetrics, 
  CompanyQueryFilters, 
  CreateCompanyPayload, 
  UpdateCompanyPayload 
} from "../types";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const companiesApi = {
  getMetrics: async (): Promise<CompanyMetrics> => {
    const { data } = await apiClient.get("/admin/companies/metrics");
    return data;
  },

  getCompanies: async (filters: CompanyQueryFilters): Promise<PaginatedResponse<Company>> => {
    const { data } = await apiClient.get("/admin/companies", { params: filters });
    return data;
  },

  getCompanyById: async (id: string): Promise<CompanyDetail> => {
    const { data } = await apiClient.get(`/admin/companies/${id}`);
    return data;
  },

  createCompany: async (payload: CreateCompanyPayload): Promise<Company> => {
    const { data } = await apiClient.post("/admin/companies", payload);
    return data;
  },

  updateCompany: async (id: string, payload: UpdateCompanyPayload): Promise<Company> => {
    const { data } = await apiClient.patch(`/admin/companies/${id}`, payload);
    return data;
  },

  bulkUpdate: async (payload: { companyIds: string[]; status?: string; tags?: string[]; segments?: string[] }): Promise<{ count: number }> => {
    const { data } = await apiClient.patch("/admin/companies/bulk/update", payload);
    return data;
  },

  exportCsvUrl: (filters: CompanyQueryFilters): string => {
    const params = new URLSearchParams(filters as any).toString();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/companies/export/csv?${params}`;
  }
};
