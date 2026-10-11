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
  ShowcaseResponse,
  AssignShowcasePayload,
  UpdateShowcaseItemPayload,
  ReorderShowcasePayload,
  UploadVideoPayload,
  OptimizeAssetPayload,
  MediaUsageResponse,
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
      timeout: 120000,
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
      timeout: 300000,
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
  },

  getShowcase: async (): Promise<ShowcaseResponse> => {
    return apiClient.get<ShowcaseResponse, ShowcaseResponse>("/admin/media/showcase");
  },

  assignShowcase: async (payload: AssignShowcasePayload): Promise<MediaAsset> => {
    const targetId = (payload.assetId || payload.mediaId || "").trim();
    const cleanTitle = payload.title !== undefined && payload.title !== null ? String(payload.title).trim() : undefined;
    const cleanDesc = payload.description !== undefined && payload.description !== null ? String(payload.description).trim() : undefined;
    const cleanAlt = payload.altText !== undefined && payload.altText !== null ? String(payload.altText).trim() : undefined;
    return apiClient.post<MediaAsset, MediaAsset>("/admin/media/showcase", {
      assetId: targetId,
      mediaId: targetId,
      section: payload.section,
      position: payload.position,
      title: cleanTitle || undefined,
      description: cleanDesc || undefined,
      altText: cleanAlt || undefined,
    });
  },

  updateShowcaseItem: async (id: string, payload: UpdateShowcaseItemPayload): Promise<MediaAsset> => {
    const cleanTitle = payload.title !== undefined && payload.title !== null ? String(payload.title).trim() : undefined;
    const cleanDesc = payload.description !== undefined && payload.description !== null ? String(payload.description).trim() : undefined;
    const cleanAlt = payload.altText !== undefined && payload.altText !== null ? String(payload.altText).trim() : undefined;
    return apiClient.patch<MediaAsset, MediaAsset>(`/admin/media/showcase/${id}`, {
      ...payload,
      title: cleanTitle,
      description: cleanDesc,
      altText: cleanAlt,
    });
  },

  reorderShowcase: async (payload: ReorderShowcasePayload): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }, { success: boolean }>("/admin/media/showcase/reorder", payload);
  },

  removeFromShowcase: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }, { success: boolean }>(`/admin/media/showcase/${id}`);
  },

  uploadVideo: async (payload: UploadVideoPayload): Promise<MediaAsset> => {
    // If no local files are being uploaded (only URL and optional posterUrl), use direct JSON endpoint
    if (!payload.file && payload.videoUrl && !payload.posterFile) {
      return apiClient.post<MediaAsset, MediaAsset>("/admin/media/add-video-url", {
        videoUrl: payload.videoUrl,
        posterUrl: payload.posterUrl,
        title: payload.title,
        description: payload.description,
        altText: payload.altText,
        categorySlug: payload.categorySlug,
        addToShowcase: payload.addToShowcase ?? true,
      }, {
        timeout: 60000,
      });
    }

    const formData = new FormData();
    if (payload.file) formData.append("file", payload.file);
    if (payload.posterFile) formData.append("poster", payload.posterFile);
    if (payload.videoUrl) formData.append("videoUrl", payload.videoUrl);
    if (payload.posterUrl) formData.append("posterUrl", payload.posterUrl);
    if (payload.title) formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.altText) formData.append("altText", payload.altText);
    if (payload.categorySlug) formData.append("categorySlug", payload.categorySlug);
    if (payload.addToShowcase !== undefined) formData.append("addToShowcase", String(payload.addToShowcase));

    return apiClient.post<MediaAsset, MediaAsset>("/admin/media/upload-video", formData, {
      timeout: 300000,
    });
  },

  optimizeAsset: async (id: string, payload: OptimizeAssetPayload): Promise<MediaAsset> => {
    return apiClient.post<MediaAsset, MediaAsset>(`/admin/media/optimize/${id}`, payload);
  },

  getMediaUsage: async (id: string): Promise<MediaUsageResponse> => {
    return apiClient.get<MediaUsageResponse, MediaUsageResponse>(`/admin/media/${id}/usage`);
  },

  syncEntities: async (): Promise<{ success: boolean; syncedTourImages: number }> => {
    return apiClient.post<{ success: boolean; syncedTourImages: number }, { success: boolean; syncedTourImages: number }>("/admin/media/sync-entities");
  },
};
