import { apiClient } from "@/lib/axios";
import { 
  Customer, 
  CustomerDetail, 
  CustomerCrmMetrics, 
  ListCustomersParams, 
  UpdateCustomerCrmPayload, 
  BulkUpdateCustomersPayload, 
  AddCustomerNotePayload, 
  AddCustomerDocumentPayload, 
  CustomerNote, 
  CustomerDocument 
} from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { requireObject, requirePaginated } from "@/lib/api-response";

export const customersApi = {
  getMetrics: async (): Promise<CustomerCrmMetrics> => {
    const res: any = await apiClient.get<CustomerCrmMetrics>("/admin/users/crm/metrics");
    return requireObject(res, "customer metrics");
  },

  getCustomers: async (params: ListCustomersParams): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<PaginatedResponse<Customer>>("/admin/users/crm/list", { params });
    return requirePaginated(response, "customers");
  },

  getCustomerDetail: async (id: string): Promise<CustomerDetail> => {
    const response = await apiClient.get<CustomerDetail>(`/admin/users/crm/${id}`);
    return response as any;
  },

  updateCustomerCrm: async (id: string, data: UpdateCustomerCrmPayload): Promise<CustomerDetail> => {
    const response = await apiClient.patch<CustomerDetail>(`/admin/users/crm/${id}`, data);
    return response as any;
  },

  bulkUpdateCustomers: async (data: BulkUpdateCustomersPayload): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ count: number }>("/admin/users/crm/bulk/update", data);
    return response as any;
  },

  addCustomerNote: async (id: string, data: AddCustomerNotePayload): Promise<CustomerNote> => {
    const response = await apiClient.post<CustomerNote>(`/admin/users/crm/${id}/notes`, data);
    return response as any;
  },

  addCustomerDocument: async (id: string, data: AddCustomerDocumentPayload): Promise<CustomerDocument> => {
    const response = await apiClient.post<CustomerDocument>(`/admin/users/crm/${id}/documents`, data);
    return response as any;
  },

  exportCustomersCsv: async (params: ListCustomersParams): Promise<Blob> => {
    const response = await apiClient.get("/admin/users/crm/export/csv", { 
      params,
      responseType: 'blob' 
    });
    return response as any;
  }
};
