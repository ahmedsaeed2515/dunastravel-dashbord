import { apiClient } from '@/lib/axios';
import { TransportationService, ServiceDraft } from '../types';

export interface GetTransportationServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  serviceType?: string;
  status?: string;
  locale?: string;
}

export const transportationApi = {
  list: async (params?: GetTransportationServicesParams): Promise<TransportationService[]> => {
    const res = await apiClient.get<any, any>('/admin/transportation/services', { params });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  getById: async (id: string): Promise<TransportationService> => {
    const res = await apiClient.get<any, any>(`/admin/transportation/services/${id}`);
    return res?.data || res;
  },

  create: async (data: Partial<ServiceDraft>): Promise<TransportationService> => {
    const res = await apiClient.post<any, any>('/admin/transportation/services', data);
    return res?.data || res;
  },

  update: async (id: string, data: Partial<ServiceDraft>): Promise<TransportationService> => {
    const res = await apiClient.put<any, any>(`/admin/transportation/services/${id}`, data);
    return res?.data || res;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<any, any>(`/admin/transportation/services/${id}`);
    return res?.data || res;
  },

  archive: async (id: string): Promise<TransportationService> => {
    const res = await apiClient.post<any, any>(`/admin/transportation/services/${id}/archive`);
    return res?.data || res;
  },

  unarchive: async (id: string): Promise<TransportationService> => {
    const res = await apiClient.post<any, any>(`/admin/transportation/services/${id}/unarchive`);
    return res?.data || res;
  },

  listBookings: async (status?: string): Promise<any[]> => {
    const res = await apiClient.get<any, any>('/admin/transportation/bookings', {
      params: status && status !== 'ALL' ? { status } : undefined,
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  updateBookingStatus: async (id: string, payload: { status: string; driverName?: string; notes?: string }) => {
    const res = await apiClient.patch<any, any>(`/admin/transportation/bookings/${id}/status`, payload);
    return res?.data || res;
  },
};
