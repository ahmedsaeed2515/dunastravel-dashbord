/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { apiClient } from "@/lib/axios";
import { Tour, TourQueryFilters, CreateTourPayload, UpdateTourPayload, BulkUpdateToursPayload, TourStats } from "../types";
import { PaginatedResponse } from "@/lib/api-types";

export const toursApi = {
  getTours: async (filters: TourQueryFilters): Promise<PaginatedResponse<Tour>> => {
    const response = await apiClient.get<PaginatedResponse<Tour>>("/admin/tours", { params: filters });
    return response as any;
  },

  getTourStats: async (): Promise<TourStats> => {
    const response = await apiClient.get<TourStats>("/admin/tours/stats");
    return response as any;
  },

  getTourBySlug: async (slug: string): Promise<Tour> => {
    const response = await apiClient.get<Tour>(`/admin/tours/${slug}`);
    return response as any;
  },

  createTour: async (data: CreateTourPayload): Promise<{ success: boolean; slug: string }> => {
    const response = await apiClient.post<{ success: boolean; slug: string }>("/admin/tours", data);
    return response as any;
  },

  updateTour: async (slug: string, data: UpdateTourPayload): Promise<{ success: boolean; slug: string }> => {
    const response = await apiClient.patch<{ success: boolean; slug: string }>(`/admin/tours/${slug}`, data);
    return response as any;
  },

  bulkUpdateTours: async (data: BulkUpdateToursPayload): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ count: number }>("/admin/tours/bulk/update", data);
    return response as any;
  },

  softDeleteTour: async (slug: string): Promise<void> => {
    await apiClient.delete(`/admin/tours/${slug}`);
  },

  exportToursCsv: async (filters: TourQueryFilters): Promise<Blob> => {
    const response = await apiClient.get("/admin/tours/export/csv", { 
      params: filters,
      responseType: 'blob' 
    });
    return response as any;
  },

  addTourItinerary: async (slug: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/admin/tours/${slug}/itinerary`, data);
    return response as any;
  },
  
  updateTourItinerary: async (slug: string, dayId: string, data: any): Promise<any> => {
    const response = await apiClient.patch(`/admin/tours/${slug}/itinerary/${dayId}`, data);
    return response as any;
  },

  removeTourItinerary: async (slug: string, dayId: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/tours/${slug}/itinerary/${dayId}`);
    return response as any;
  },

  addTourImage: async (slug: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/admin/tours/${slug}/images`, data);
    return response as any;
  },

  removeTourImage: async (slug: string, imageId: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/tours/${slug}/images/${imageId}`);
    return response as any;
  },

  reorderTourImage: async (slug: string, imageId: string, data: { newOrder: number }): Promise<any> => {
    const response = await apiClient.patch(`/admin/tours/${slug}/images/${imageId}/reorder`, data);
    return response as any;
  }
};
