/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/lib/api-types";

export interface TourLandingPage {
  id: string;
  slug: string;
  type: string;
  titleJsonb: Record<string, string>;
  subtitleJsonb?: Record<string, string> | null;
  descriptionJsonb?: Record<string, string> | null;
  briefJsonb?: Record<string, string> | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  seoTitleJsonb?: Record<string, string> | null;
  seoDescriptionJsonb?: Record<string, string> | null;
  seoKeywordsJsonb?: Record<string, string> | null;
  sectionsJsonb?: any;
  status: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  translationCompletion?: Record<string, { title: boolean; subtitle: boolean; description: boolean; isComplete: boolean }>;
  totalToursCount?: number;
  activeToursCount?: number;
  tours?: Array<{
    id: string;
    landingPageId: string;
    tourId: string;
    sortOrder: number;
    isFeatured: boolean;
    isVisible: boolean;
    customBadge?: Record<string, string> | null;
    tour: {
      id: string;
      slug: string;
      titleJsonb: Record<string, string>;
      isActive: boolean;
      status: string;
      basePriceUsd?: string;
      category?: string;
      images?: Array<{ imageUrl: string }>;
    };
  }>;
}

export interface LandingPageFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  isActive?: boolean;
}

export const landingPagesApi = {
  getLandingPages: async (filters?: LandingPageFilters): Promise<PaginatedResponse<TourLandingPage>> => {
    const response = await apiClient.get<PaginatedResponse<TourLandingPage>>("/admin/tour-landing-pages", { params: filters });
    return response as any;
  },

  getLandingPageBySlug: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.get<TourLandingPage>(`/admin/tour-landing-pages/${slug}`);
    return response as any;
  },

  createLandingPage: async (data: Partial<TourLandingPage>): Promise<TourLandingPage> => {
    const response = await apiClient.post<TourLandingPage>("/admin/tour-landing-pages", data);
    return response as any;
  },

  updateLandingPage: async (slug: string, data: Partial<TourLandingPage>): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}`, data);
    return response as any;
  },

  publishLandingPage: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/publish`);
    return response as any;
  },

  unpublishLandingPage: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/unpublish`);
    return response as any;
  },

  activateLandingPage: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/activate`);
    return response as any;
  },

  deactivateLandingPage: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/deactivate`);
    return response as any;
  },

  archiveLandingPage: async (slug: string): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/archive`);
    return response as any;
  },

  deleteLandingPage: async (slug: string): Promise<void> => {
    await apiClient.delete(`/admin/tour-landing-pages/${slug}`);
  },

  reorderLandingPages: async (items: { id: string; sortOrder: number }[]): Promise<any> => {
    const response = await apiClient.patch("/admin/tour-landing-pages/reorder", { items });
    return response as any;
  },

  attachTours: async (slug: string, payload: { tourIds: string[]; isFeatured?: boolean; isVisible?: boolean }): Promise<TourLandingPage> => {
    const response = await apiClient.post<TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours`, payload);
    return response as any;
  },

  detachTour: async (slug: string, tourId: string): Promise<void> => {
    await apiClient.delete(`/admin/tour-landing-pages/${slug}/tours/${tourId}`);
  },

  updateTourRelation: async (slug: string, tourId: string, payload: { sortOrder?: number; isFeatured?: boolean; isVisible?: boolean }): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours/${tourId}`, payload);
    return response as any;
  },

  reorderToursInLandingPage: async (slug: string, items: { tourId: string; sortOrder: number }[]): Promise<TourLandingPage> => {
    const response = await apiClient.patch<TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours/reorder`, { items });
    return response as any;
  },
};
