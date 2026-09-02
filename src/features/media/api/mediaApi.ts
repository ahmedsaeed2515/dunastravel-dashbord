import { apiClient } from "@/lib/axios";
import { 
  MediaAsset,
  MediaSummary,
  MediaQueryFilters,
  UploadMediaPayload,
  UploadBulkMediaPayload,
  ImportMediaUrlsPayload,
  UpdateMediaPayload,
  BulkMoveMediaPayload,
  MediaCategoryItem,
  CreateMediaCategoryPayload,
  UpdateMediaCategoryPayload,
} from "../types";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const mediaApi = {
  getMediaAssets: async (filters: MediaQueryFilters = {}): Promise<PaginatedResponse<MediaAsset>> => {
    return apiClient.get<PaginatedResponse<MediaAsset>, PaginatedResponse<MediaAsset>>("/admin/media", { params: filters });
  },

  getSummary: async (): Promise<MediaSummary> => {
    return apiClient.get<MediaSummary, MediaSummary>('/admin/media/summary');
  },

  getCategories: async (): Promise<MediaCategoryItem[]> => {
    return apiClient.get<MediaCategoryItem[], MediaCategoryItem[]>('/admin/media/categories');
  },

  createCategory: async (payload: CreateMediaCategoryPayload): Promise<MediaCategoryItem> => {
    return apiClient.post<MediaCategoryItem, MediaCategoryItem>('/admin/media/categories', payload);
  },

  updateCategory: async (slug: string, payload: UpdateMediaCategoryPayload): Promise<MediaCategoryItem> => {
    return apiClient.put<MediaCategoryItem, MediaCategoryItem>(`/admin/media/categories/${slug}`, payload);
  },

  deleteCategory: async (slug: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }, { success: boolean; message: string }>(`/admin/media/categories/${slug}`);
  },

  uploadMedia: async (payload: UploadMediaPayload): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("entityType", payload.entityType);
    
    if (payload.entityId) formData.append("entityId", payload.entityId);
    if (payload.altText) formData.append("altText", payload.altText);
    if (payload.categorySlug) formData.append("categorySlug", payload.categorySlug);

    return apiClient.post<MediaAsset, MediaAsset>("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadBulkMedia: async (payload: UploadBulkMediaPayload): Promise<MediaAsset[]> => {
    const formData = new FormData();
    for (const file of payload.files) {
      formData.append("files", file);
    }
    formData.append("entityType", payload.entityType);

    if (payload.entityId) formData.append("entityId", payload.entityId);
    if (payload.categorySlug) formData.append("categorySlug", payload.categorySlug);

    if (payload.altTextsMap && Object.keys(payload.altTextsMap).length > 0) {
      formData.append("altText", JSON.stringify(payload.altTextsMap));
    } else if (payload.altText) {
      formData.append("altText", payload.altText);
    }

    return apiClient.post<MediaAsset[], MediaAsset[]>("/admin/media/upload-bulk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  importMediaUrls: async (payload: ImportMediaUrlsPayload): Promise<MediaAsset[]> => {
    return apiClient.post<MediaAsset[], MediaAsset[]>("/admin/media/import-urls", payload);
  },

  updateMedia: async (id: string, payload: UpdateMediaPayload): Promise<MediaAsset> => {
    return apiClient.patch<MediaAsset, MediaAsset>(`/admin/media/${id}`, payload);
  },

  bulkMoveMedia: async (payload: BulkMoveMediaPayload): Promise<{ success: boolean; updatedCount: number }> => {
    return apiClient.post<{ success: boolean; updatedCount: number }, { success: boolean; updatedCount: number }>('/admin/media/bulk-move', payload);
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  }
};
