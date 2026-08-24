import { apiClient } from '@/lib/axios';
import { AdminHotel, HotelPayload, HotelsQuery, PaginatedHotels } from '../types';

export const hotelsApi = {
  list: (query: HotelsQuery): Promise<PaginatedHotels> =>
    apiClient.get<PaginatedHotels, PaginatedHotels>('/admin/hotels', { params: query }),
  create: (payload: HotelPayload): Promise<AdminHotel> =>
    apiClient.post<AdminHotel, AdminHotel>('/admin/hotels', payload),
  update: (id: string, payload: HotelPayload): Promise<AdminHotel> =>
    apiClient.put<AdminHotel, AdminHotel>(`/admin/hotels/${id}`, payload),
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/hotels/${id}`);
  },
};
