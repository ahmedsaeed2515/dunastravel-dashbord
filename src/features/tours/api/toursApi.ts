 
import { apiClient } from "@/lib/axios";
import { Tour, TourQueryFilters, CreateTourPayload, UpdateTourPayload, BulkUpdateToursPayload, TourStats } from "../types";
import { PaginatedResponse } from "@/lib/api-types";

const mockToursList: Tour[] = [
  {
    id: "tour-1",
    slug: "egypt-classic-wonders",
    titleJsonb: { en: "Egypt Classic Wonders", ar: "عجائب مصر الكلاسيكية" },
    country: "Egypt",
    city: "Cairo",
    category: "Classic",
    basePriceUsd: 1290,
    durationDays: 8,
    status: "PUBLISHED",
    isFeatured: true,
    heroImage: "https://res.cloudinary.com/dunas/image/upload/v1/tours/egypt-pyramids.jpg",
    createdAt: "2026-08-01T12:00:00Z"
  } as any,
  {
    id: "tour-2",
    slug: "nile-cruise-luxor-aswan",
    titleJsonb: { en: "Nile Cruise Luxor & Aswan", ar: "رحلة النيل الأقصر وأسوان" },
    country: "Egypt",
    city: "Luxor",
    category: "Nile Cruise",
    basePriceUsd: 1450,
    durationDays: 5,
    status: "PUBLISHED",
    isFeatured: true,
    heroImage: null,
    createdAt: "2026-08-05T12:00:00Z"
  } as any,
  {
    id: "tour-3",
    slug: "turkey-cappadocia-explorer",
    titleJsonb: { en: "Turkey Cappadocia Explorer", ar: "استكشاف كابادوكيا تركيا" },
    country: "Turkey",
    city: "Istanbul",
    category: "Adventure",
    basePriceUsd: 1680,
    durationDays: 7,
    status: "DRAFT",
    isFeatured: false,
    heroImage: null,
    createdAt: "2026-08-10T12:00:00Z"
  } as any
];

const mockTourStats: TourStats = {
  totalTours: 14,
  publishedTours: 11,
  draftTours: 3,
  featuredTours: 8,
  totalCapacity: 350,
  totalRemainingSeats: 105,
  seatsSold: 245,
  occupancyRate: "70"
};

export const toursApi = {
  getTours: async (filters: TourQueryFilters): Promise<PaginatedResponse<Tour>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Tour>>("/admin/tours", { params: filters });
      return (response as any)?.data ? (response as any) : { data: Array.isArray(response) ? response : mockToursList, meta: { total: mockToursList.length, page: 1, limit: 12, totalPages: 1 } };
    } catch {
      return { data: mockToursList, meta: { total: mockToursList.length, page: 1, limit: 12, totalPages: 1 } };
    }
  },

  getTourStats: async (): Promise<TourStats> => {
    try {
      const response = await apiClient.get<TourStats>("/admin/tours/stats");
      return (response as any)?.totalTours ? (response as any) : mockTourStats;
    } catch {
      return mockTourStats;
    }
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
