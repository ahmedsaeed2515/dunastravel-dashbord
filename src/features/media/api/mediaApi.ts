import { apiClient } from "@/lib/axios";
import { 
  MediaAsset,
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
    const { data } = await apiClient.get("/admin/media", { params: filters });
    return data;
  },

  uploadMedia: async (payload: UploadMediaPayload): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("entityType", payload.entityType);
    
    if (payload.entityId) formData.append("entityId", payload.entityId);
    if (payload.altText) formData.append("altText", payload.altText);

    const { data } = await apiClient.post("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  }
};
