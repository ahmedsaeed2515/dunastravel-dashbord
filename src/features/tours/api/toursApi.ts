import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/lib/api-types";
import {
  Tour,
  TourQueryFilters,
  CreateTourPayload,
  UpdateTourPayload,
  BulkUpdateToursPayload,
  TourAvailability,
  TourStats,
} from "../types";

export const toursApi = {
  getTours: async (filters: TourQueryFilters): Promise<PaginatedResponse<Tour>> => {
    const response = await apiClient.get<PaginatedResponse<Tour>>("/admin/tours", {
      params: filters,
    });
    if (Array.isArray(response)) {
      return {
        data: response as unknown as Tour[],
        meta: {
          total: response.length,
          page: 1,
          limit: filters.limit ?? 12,
          totalPages: 1,
        },
      };
    }
    const payload = response as unknown as PaginatedResponse<Tour>;
    if (Array.isArray(payload?.data)) return payload;
    throw new Error("The tours API returned an invalid response");
  },

  getTourStats: async (): Promise<TourStats> => {
    const response = await apiClient.get<TourStats>("/admin/tours/stats");
    return response as unknown as TourStats;
  },

  getTourBySlug: async (slug: string): Promise<Tour> => {
    const response = await apiClient.get<Tour>(`/admin/tours/${slug}`);
    return response as unknown as Tour;
  },

  getAvailability: async (slug: string): Promise<TourAvailability[]> => {
    const response = await apiClient.get<{ availabilities: TourAvailability[] }>(
      `/tours/${encodeURIComponent(slug)}/availability`,
    );
    const payload = response as unknown as { availabilities?: TourAvailability[] };
    if (!Array.isArray(payload.availabilities)) throw new Error("Invalid tour availability response");
    return payload.availabilities;
  },

  createTour: async (data: CreateTourPayload): Promise<{ success: boolean; slug: string }> => {
    const response = await apiClient.post<{ success: boolean; slug: string }>("/admin/tours", data);
    return response as unknown as { success: boolean; slug: string };
  },

  updateTour: async (slug: string, data: UpdateTourPayload): Promise<{ success: boolean; slug: string }> => {
    const response = await apiClient.patch<{ success: boolean; slug: string }>(`/admin/tours/${slug}`, data);
    return response as unknown as { success: boolean; slug: string };
  },

  bulkUpdateTours: async (data: BulkUpdateToursPayload): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ count: number }>("/admin/tours/bulk/update", data);
    return response as unknown as { count: number };
  },

  softDeleteTour: async (slug: string): Promise<void> => {
    await apiClient.delete(`/admin/tours/${slug}`);
  },

  exportToursCsv: async (filters: TourQueryFilters): Promise<Blob> => {
    const response = await apiClient.get("/admin/tours/export/csv", {
      params: filters,
      responseType: "blob",
    });
    return response as unknown as Blob;
  },

  addTourItinerary: async (slug: string, data: unknown): Promise<unknown> => {
    return apiClient.post(`/admin/tours/${slug}/itinerary`, data);
  },

  updateTourItinerary: async (slug: string, dayId: string, data: unknown): Promise<unknown> => {
    return apiClient.patch(`/admin/tours/${slug}/itinerary/${dayId}`, data);
  },

  removeTourItinerary: async (slug: string, dayId: string): Promise<unknown> => {
    return apiClient.delete(`/admin/tours/${slug}/itinerary/${dayId}`);
  },

  addTourImage: async (slug: string, data: unknown): Promise<unknown> => {
    return apiClient.post(`/admin/tours/${slug}/images`, data);
  },

  removeTourImage: async (slug: string, imageId: string): Promise<unknown> => {
    return apiClient.delete(`/admin/tours/${slug}/images/${imageId}`);
  },

  reorderTourImage: async (
    slug: string,
    imageId: string,
    data: { newOrder: number },
  ): Promise<unknown> => {
    return apiClient.patch(`/admin/tours/${slug}/images/${imageId}/reorder`, data);
  },
};
