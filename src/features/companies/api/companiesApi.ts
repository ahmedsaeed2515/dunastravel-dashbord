import { apiClient } from "@/lib/axios";
import { 
  Company, 
  CompanyDetail, 
  CompanyMetrics, 
  CompanyQueryFilters, 
  CompanyStatus,
  CreateCompanyPayload, 
  UpdateCompanyPayload 
} from "../types";
import { PaginatedResponse } from "@/lib/api-types";

const normalizeCompany = (raw: any): Company => ({
  ...raw,
  commissionRate: parseFloat(String(raw?.commissionRate ?? '0')) || 0,
  currentBalance: parseFloat(String(raw?.currentBalance ?? '0')) || 0,
});

const normalizeCompanyDetail = (raw: any): CompanyDetail => ({
  ...raw,
  ...normalizeCompany(raw),
  users: Array.isArray(raw?.users) ? raw.users : [],
  bookings: Array.isArray(raw?.bookings) ? raw.bookings : [],
});

export const companiesApi = {
  getMetrics: async (): Promise<CompanyMetrics> => {
    return apiClient.get<CompanyMetrics, CompanyMetrics>("/admin/companies/metrics");
  },

  getCompanies: async (filters: CompanyQueryFilters): Promise<PaginatedResponse<Company>> => {
    const res = await apiClient.get<PaginatedResponse<Company>, PaginatedResponse<Company>>("/admin/companies", { params: filters });
    return {
      ...res,
      data: Array.isArray(res?.data) ? res.data.map(normalizeCompany) : [],
    };
  },

  getCompanyById: async (id: string): Promise<CompanyDetail> => {
    const res = await apiClient.get<CompanyDetail, CompanyDetail>(`/admin/companies/${id}`);
    return normalizeCompanyDetail(res);
  },

  createCompany: async (payload: CreateCompanyPayload): Promise<Company> => {
    const res = await apiClient.post<Company, Company>("/admin/companies", payload);
    return normalizeCompany(res);
  },

  updateCompany: async (id: string, payload: UpdateCompanyPayload): Promise<Company> => {
    const res = await apiClient.patch<Company, Company>(`/admin/companies/${id}`, payload);
    return normalizeCompany(res);
  },

  bulkUpdate: async (payload: { companyIds: string[]; status?: CompanyStatus; tags?: string[]; segments?: string[] }): Promise<{ count: number }> => {
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
  }
};
