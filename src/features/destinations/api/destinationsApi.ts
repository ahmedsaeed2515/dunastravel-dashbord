import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/lib/api-types";

export type DestinationJsonValue =
  | string
  | number
  | boolean
  | null
  | DestinationJsonValue[]
  | { [key: string]: DestinationJsonValue };

export interface DestinationTourItem {
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
}

export interface DestinationItem {
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
  sectionsJsonb?: DestinationJsonValue | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE";
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  translationCompletion?: Record<
    string,
    { title: boolean; subtitle: boolean; description: boolean; isComplete: boolean }
  >;
  totalToursCount?: number;
  activeToursCount?: number;
  tours?: DestinationTourItem[];
}

export interface DestinationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  isActive?: boolean;
}

export interface DestinationMutationPayload {
  expectedUpdatedAt?: string;
  slug?: string;
  type?: "DESTINATION" | "THEME" | "COLLECTION";
  titleJsonb: Record<string, string>;
  subtitleJsonb?: Record<string, string> | null;
  descriptionJsonb?: Record<string, string> | null;
  briefJsonb?: Record<string, string> | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  seoTitleJsonb?: Record<string, string> | null;
  seoDescriptionJsonb?: Record<string, string> | null;
  seoKeywordsJsonb?: Record<string, string> | null;
  sectionsJsonb?: DestinationJsonValue | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE";
  isActive?: boolean;
  sortOrder?: number;
}

export const destinationsApi = {
  getDestinations: async (
    filters?: DestinationFilters
  ): Promise<PaginatedResponse<DestinationItem>> => {
    return apiClient.get<
      PaginatedResponse<DestinationItem>,
      PaginatedResponse<DestinationItem>
    >("/admin/destinations", { params: filters });
  },

  getDestinationBySlug: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.get<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}`
    );
  },

  createDestination: async (
    data: DestinationMutationPayload
  ): Promise<DestinationItem> => {
    return apiClient.post<DestinationItem, DestinationItem>(
      "/admin/destinations",
      data
    );
  },

  updateDestination: async (
    idOrSlug: string,
    data: DestinationMutationPayload
  ): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}`,
      data
    );
  },

  publishDestination: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/publish`
    );
  },

  unpublishDestination: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/unpublish`
    );
  },

  activateDestination: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/activate`
    );
  },

  deactivateDestination: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/deactivate`
    );
  },

  archiveDestination: async (idOrSlug: string): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/archive`
    );
  },

  deleteDestination: async (idOrSlug: string): Promise<void> => {
    await apiClient.delete(`/admin/destinations/${idOrSlug}`);
  },

  reorderDestinations: async (
    items: { id: string; sortOrder: number }[]
  ): Promise<{ success: true; count: number }> => {
    return apiClient.patch<
      { success: true; count: number },
      { success: true; count: number }
    >("/admin/destinations/reorder", { items });
  },

  attachTours: async (
    idOrSlug: string,
    payload: {
      tourIds: string[];
      isFeatured?: boolean;
      isVisible?: boolean;
    }
  ): Promise<DestinationItem> => {
    return apiClient.post<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/tours`,
      payload
    );
  },

  detachTour: async (idOrSlug: string, tourId: string): Promise<void> => {
    await apiClient.delete(`/admin/destinations/${idOrSlug}/tours/${tourId}`);
  },

  updateTourRelation: async (
    idOrSlug: string,
    tourId: string,
    payload: {
      sortOrder?: number;
      isFeatured?: boolean;
      isVisible?: boolean;
      customBadge?: Record<string, string>;
    }
  ): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/tours/${tourId}`,
      payload
    );
  },

  reorderToursInDestination: async (
    idOrSlug: string,
    items: { tourId?: string; slug?: string; sortOrder: number }[]
  ): Promise<DestinationItem> => {
    return apiClient.patch<DestinationItem, DestinationItem>(
      `/admin/destinations/${idOrSlug}/tours/reorder`,
      { items }
    );
  },
};
