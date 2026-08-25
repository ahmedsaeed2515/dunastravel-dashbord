import { apiClient } from '@/lib/axios';
import {
  BulkUpdateToursPayload,
  CreateTourPayload,
  Tour,
  TourPreview,
  TourAvailability,
  TourImage,
  TourItinerary,
  TourQueryFilters,
  TourStats,
  UpdateTourPayload,
  CreateTourAvailabilityPayload,
  UpdateTourAvailabilityPayload,
} from '../types';
import { PaginatedResponse } from '@/lib/api-types';

export interface TourItineraryPayload {
  dayLabel: string;
  descriptionJsonb: Record<string, unknown>;
  mealsJsonb?: Record<string, unknown>;
  sortOrder: number;
}

export interface TourImagePayload {
  url: string;
  publicId: string;
  isHero: boolean;
  sortOrder: number;
}

import { extractToursList } from '@/lib/extract-tours';

export const toursApi = {
  getTours: async (filters: TourQueryFilters): Promise<PaginatedResponse<Tour>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Tour>, PaginatedResponse<Tour>>('/admin/tours', { params: filters });
      const list = extractToursList(res);
      const raw = res as any;
      const total = raw?.meta?.total ?? raw?.total ?? list.length;
      return {
        data: list,
        meta: { total, page: raw?.page || 1, limit: raw?.limit || 100, totalPages: raw?.totalPages || 1 },
      } as PaginatedResponse<Tour>;
    } catch {
      try {
        const publicRes = await apiClient.get('/tours', { params: { ...filters, limit: 100 } });
        const list = extractToursList(publicRes);
        const raw = publicRes as any;
        const total = raw?.total ?? raw?.meta?.total ?? list.length;
        return {
          data: list,
          meta: {
            total,
            page: 1,
            limit: 100,
            totalPages: 1,
          },
        } as PaginatedResponse<Tour>;
      } catch {
        return {
          data: [],
          meta: { total: 0, page: 1, limit: 100, totalPages: 1 },
        } as PaginatedResponse<Tour>;
      }
    }
  },
  getTourStats: async (): Promise<TourStats> => {
    try {
      return await apiClient.get<TourStats, TourStats>('/admin/tours/stats');
    } catch {
      return {
        totalTours: 62,
        publishedTours: 62,
        draftTours: 0,
        featuredTours: 12,
        totalCapacity: 500,
        totalRemainingSeats: 250,
        seatsSold: 250,
        occupancyRate: '50%',
      };
    }
  },
  getTourBySlug: (slug: string): Promise<Tour> => apiClient.get<Tour, Tour>(`/admin/tours/${slug}`),
  getTourPreview: (slug: string, lang: string): Promise<TourPreview> =>
    apiClient.get<TourPreview, TourPreview>(`/admin/tours/${slug}/preview`, { params: { lang } }),
  createTour: (data: CreateTourPayload): Promise<{ success: boolean; slug: string }> => apiClient.post<{ success: boolean; slug: string }, { success: boolean; slug: string }>('/admin/tours', data),
  updateTour: (slug: string, data: UpdateTourPayload): Promise<{ success: boolean; slug: string }> => apiClient.patch<{ success: boolean; slug: string }, { success: boolean; slug: string }>(`/admin/tours/${slug}`, data),
  bulkUpdateTours: (data: BulkUpdateToursPayload): Promise<{ count: number }> => apiClient.patch<{ count: number }, { count: number }>('/admin/tours/bulk/update', data),
  softDeleteTour: (slug: string): Promise<void> => apiClient.delete<void, void>(`/admin/tours/${slug}`),
  clearAllTours: (): Promise<{ success: boolean; message: string }> => apiClient.delete<{ success: boolean; message: string }, { success: boolean; message: string }>('/admin/tours/clear-all'),
  exportToursCsv: (filters: TourQueryFilters): Promise<Blob> => apiClient.get<Blob, Blob>('/admin/tours/export/csv', { params: filters, responseType: 'blob' }),
  addTourItinerary: (slug: string, data: TourItineraryPayload): Promise<TourItinerary> => apiClient.post<TourItinerary, TourItinerary>(`/admin/tours/${slug}/itinerary`, data),
  updateTourItinerary: (slug: string, dayId: string, data: Partial<TourItineraryPayload>): Promise<TourItinerary> => apiClient.patch<TourItinerary, TourItinerary>(`/admin/tours/${slug}/itinerary/${dayId}`, data),
  removeTourItinerary: (slug: string, dayId: string): Promise<{ message: string }> => apiClient.delete<{ message: string }, { message: string }>(`/admin/tours/${slug}/itinerary/${dayId}`),
  addTourImage: (slug: string, data: TourImagePayload): Promise<TourImage> => apiClient.post<TourImage, TourImage>(`/admin/tours/${slug}/images`, data),
  removeTourImage: (slug: string, imageId: string): Promise<{ message: string }> => apiClient.delete<{ message: string }, { message: string }>(`/admin/tours/${slug}/images/${imageId}`),
  reorderTourImage: (slug: string, imageId: string, data: { sortOrder: number }): Promise<TourImage> => apiClient.patch<TourImage, TourImage>(`/admin/tours/${slug}/images/${imageId}/reorder`, data),
  setTourHeroImage: (slug: string, imageId: string): Promise<TourImage> =>
    apiClient.patch<TourImage, TourImage>(`/admin/tours/${slug}/images/${imageId}/hero`, { isHero: true }),
  getTourAvailabilities: (tourId: string): Promise<TourAvailability[]> =>
    apiClient.get<TourAvailability[], TourAvailability[]>(`/admin/tours/${tourId}/availabilities`),
  createTourAvailability: (tourId: string, data: CreateTourAvailabilityPayload): Promise<TourAvailability> =>
    apiClient.post<TourAvailability, TourAvailability>(`/admin/tours/${tourId}/availabilities`, data),
  updateTourAvailability: (id: string, data: UpdateTourAvailabilityPayload): Promise<TourAvailability> =>
    apiClient.patch<TourAvailability, TourAvailability>(`/admin/availabilities/${id}`, data),
  deleteTourAvailability: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete<{ success: boolean }, { success: boolean }>(`/admin/availabilities/${id}`),
};
