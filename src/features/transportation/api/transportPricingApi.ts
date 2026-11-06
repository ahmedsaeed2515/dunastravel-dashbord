import { apiClient } from '@/lib/axios';
import { TransportPricing, CreateTransportPricingDto, UpdateTransportPricingDto, TransportPricingFilters } from '../types';

export interface GetTransportPricingParams {
  tourId?: string;
  bookingId?: string;
  category?: string;
  passengerRange?: string;
}

export const transportPricingApi = {
  list: async (params?: GetTransportPricingParams): Promise<TransportPricing[]> => {
    const res = await apiClient.get<any, any>('/admin/transport-pricing', { params });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  getById: async (id: string): Promise<TransportPricing> => {
    const res = await apiClient.get<any, any>(`/admin/transport-pricing/${id}`);
    return res?.data || res;
  },

  create: async (dto: CreateTransportPricingDto): Promise<TransportPricing> => {
    const res = await apiClient.post<any, any>('/admin/transport-pricing', dto);
    return res?.data || res;
  },

  update: async (id: string, dto: UpdateTransportPricingDto): Promise<TransportPricing> => {
    const res = await apiClient.patch<any, any>(`/admin/transport-pricing/${id}`, dto);
    return res?.data || res;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<any, any>(`/admin/transport-pricing/${id}`);
    return res?.data || res;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<TransportPricing> => {
    const res = await apiClient.patch<any, any>(`/admin/transport-pricing/${id}/toggle`, { isActive });
    return res?.data || res;
  },
};