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

export const customersApi = {
  getMetrics: async (): Promise<CustomerCrmMetrics> => {
    return apiClient.get<CustomerCrmMetrics, CustomerCrmMetrics>("/admin/users/crm/metrics");
  },

  getCustomers: async (params: ListCustomersParams): Promise<PaginatedResponse<Customer>> => {
    return apiClient.get<PaginatedResponse<Customer>, PaginatedResponse<Customer>>("/admin/users/crm/list", { params });
  },

  getCustomerDetail: async (id: string): Promise<CustomerDetail> => {
    return apiClient.get<CustomerDetail, CustomerDetail>(`/admin/users/crm/${id}`);
  },

  updateCustomerCrm: async (id: string, data: UpdateCustomerCrmPayload): Promise<CustomerDetail> => {
    return apiClient.patch<CustomerDetail, CustomerDetail>(`/admin/users/crm/${id}`, data);
  },

  bulkUpdateCustomers: async (data: BulkUpdateCustomersPayload): Promise<{ count: number }> => {
    return apiClient.patch<{ count: number }, { count: number }>("/admin/users/crm/bulk/update", data);
  },

  addCustomerNote: async (id: string, data: AddCustomerNotePayload): Promise<CustomerNote> => {
    return apiClient.post<CustomerNote, CustomerNote>(`/admin/users/crm/${id}/notes`, data);
  },

  addCustomerDocument: async (id: string, data: AddCustomerDocumentPayload): Promise<CustomerDocument> => {
    return apiClient.post<CustomerDocument, CustomerDocument>(`/admin/users/crm/${id}/documents`, data);
  },

  exportCustomersCsv: async (params: ListCustomersParams): Promise<Blob> => {
    return apiClient.get<Blob, Blob>("/admin/users/crm/export/csv", { 
      params,
      responseType: 'blob' 
    });
  }
};
