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

function requireMediaPage(response: unknown): PaginatedResponse<MediaAsset> {
  const value = response && typeof response === "object" && "data" in response && !Array.isArray((response as { data: unknown }).data)
    ? (response as { data: unknown }).data
    : response;
  const page = value as PaginatedResponse<MediaAsset>;
  if (!page || !Array.isArray(page.data) || !page.meta || typeof page.meta.total !== "number") throw new Error("Invalid media response");
  return page;
}

export const mediaApi = {
  getMediaAssets: async (filters: MediaQueryFilters = {}): Promise<PaginatedResponse<MediaAsset>> => {
    const response = await apiClient.get("/admin/media", { params: filters });
    return requireMediaPage(response);
  },

  uploadMedia: async (payload: UploadMediaPayload): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("entityType", payload.entityType);
    
    if (payload.entityId) formData.append("entityId", payload.entityId);
    if (payload.altText) formData.append("altText", payload.altText);

    const response = await apiClient.post("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const value = response && typeof response === "object" && "data" in response ? (response as { data: unknown }).data : response;
    if (!value || typeof value !== "object" || !("id" in value) || !("url" in value)) throw new Error("Invalid media upload response");
    return value as MediaAsset;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  }
};
