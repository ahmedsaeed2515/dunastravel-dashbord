import { apiClient } from "@/lib/axios";
import { 
  MediaAsset,
  MediaSummary,
  MediaQueryFilters,
  UploadMediaPayload
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

  uploadMedia: async (payload: UploadMediaPayload): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("entityType", payload.entityType);
    
    if (payload.entityId) formData.append("entityId", payload.entityId);
    if (payload.altText) formData.append("altText", payload.altText);

    return apiClient.post<MediaAsset, MediaAsset>("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  }
};
