import { apiClient } from '@/lib/axios';
import { AdminHotel, HotelPayload, HotelsQuery, PaginatedHotels, SeasonPayload, SeasonRecord } from '../types';

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
  publish: (id: string): Promise<AdminHotel> => apiClient.post<AdminHotel, AdminHotel>(`/admin/hotels/${id}/publish`),
  unpublish: (id: string): Promise<AdminHotel> => apiClient.post<AdminHotel, AdminHotel>(`/admin/hotels/${id}/unpublish`),
  archive: (id: string): Promise<AdminHotel> => apiClient.post<AdminHotel, AdminHotel>(`/admin/hotels/${id}/archive`),
  unarchive: (id: string): Promise<AdminHotel> => apiClient.post<AdminHotel, AdminHotel>(`/admin/hotels/${id}/unarchive`),
  restore: (id: string): Promise<AdminHotel> => apiClient.post<AdminHotel, AdminHotel>(`/admin/hotels/${id}/restore`),
  listSeasons: (): Promise<SeasonRecord[]> =>
    apiClient.get<SeasonRecord[], SeasonRecord[]>('/admin/hotels/seasons'),
  createSeason: (payload: SeasonPayload): Promise<SeasonRecord> =>
    apiClient.post<SeasonRecord, SeasonRecord>('/admin/hotels/seasons', payload),
  updateSeason: (id: string, payload: Partial<SeasonPayload>): Promise<SeasonRecord> =>
    apiClient.put<SeasonRecord, SeasonRecord>(`/admin/hotels/seasons/${id}`, payload),
  deleteSeason: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/hotels/seasons/${id}`);
  },
};

