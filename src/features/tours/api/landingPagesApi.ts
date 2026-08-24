 
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/lib/api-types";

export type LandingPageJsonValue = string | number | boolean | null | LandingPageJsonValue[] | { [key: string]: LandingPageJsonValue };

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
  sectionsJsonb?: LandingPageJsonValue | null;
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

export type LandingPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE";
export type LandingPageType = "DESTINATION" | "THEME" | "COLLECTION";

export interface LandingPageMutationPayload {
  /** Version captured when the editor opened; rejected when stale. */
  expectedUpdatedAt?: string;
  slug?: string;
  type?: LandingPageType;
  titleJsonb?: Record<string, string>;
  subtitleJsonb?: Record<string, string> | null;
  descriptionJsonb?: Record<string, string> | null;
  briefJsonb?: Record<string, string> | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  seoTitleJsonb?: Record<string, string> | null;
  seoDescriptionJsonb?: Record<string, string> | null;
  seoKeywordsJsonb?: Record<string, string> | null;
  sectionsJsonb?: LandingPageJsonValue | null;
  status?: LandingPageStatus;
  isActive?: boolean;
  sortOrder?: number;
}

export const landingPagesApi = {
  getLandingPages: async (filters?: LandingPageFilters): Promise<PaginatedResponse<TourLandingPage>> => {
    return apiClient.get<PaginatedResponse<TourLandingPage>, PaginatedResponse<TourLandingPage>>("/admin/tour-landing-pages", { params: filters });
  },

  getLandingPageBySlug: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.get<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}`);
  },

  createLandingPage: async (data: LandingPageMutationPayload): Promise<TourLandingPage> => {
    return apiClient.post<TourLandingPage, TourLandingPage>("/admin/tour-landing-pages", data);
  },

  updateLandingPage: async (slug: string, data: LandingPageMutationPayload): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}`, data);
  },

  publishLandingPage: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/publish`);
  },

  unpublishLandingPage: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/unpublish`);
  },

  activateLandingPage: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/activate`);
  },

  deactivateLandingPage: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/deactivate`);
  },

  archiveLandingPage: async (slug: string): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/archive`);
  },

  deleteLandingPage: async (slug: string): Promise<void> => {
    await apiClient.delete(`/admin/tour-landing-pages/${slug}`);
  },

  reorderLandingPages: async (items: { id: string; sortOrder: number }[]): Promise<{ success: true; count: number }> => {
    return apiClient.patch<{ success: true; count: number }, { success: true; count: number }>("/admin/tour-landing-pages/reorder", { items });
  },

  attachTours: async (slug: string, payload: { tourIds: string[]; isFeatured?: boolean; isVisible?: boolean }): Promise<TourLandingPage> => {
    return apiClient.post<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours`, payload);
  },

  detachTour: async (slug: string, tourId: string): Promise<void> => {
    await apiClient.delete(`/admin/tour-landing-pages/${slug}/tours/${tourId}`);
  },

  updateTourRelation: async (slug: string, tourId: string, payload: { sortOrder?: number; isFeatured?: boolean; isVisible?: boolean; customBadge?: Record<string, string> }): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours/${tourId}`, payload);
  },

  reorderToursInLandingPage: async (slug: string, items: { tourId: string; sortOrder: number }[]): Promise<TourLandingPage> => {
    return apiClient.patch<TourLandingPage, TourLandingPage>(`/admin/tour-landing-pages/${slug}/tours/reorder`, { items });
  },
};
