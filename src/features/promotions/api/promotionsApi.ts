import { apiClient } from "@/lib/axios";
import { 
  Promotion,
  PromotionQueryFilters,
  CreatePromotionPayload,
  UpdatePromotionPayload
} from "../types";
import { requireObject, requirePaginated } from "@/lib/api-response";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const promotionsApi = {
  getPromotions: async (filters: PromotionQueryFilters = {}): Promise<PaginatedResponse<Promotion>> => {
    const response = await apiClient.get("/admin/promotions", { params: filters });
    return requirePaginated(response, "promotions");
  },

  getPromotionById: async (id: string): Promise<Promotion> => {
    const response = await apiClient.get(`/admin/promotions/${id}`);
    return requireObject(response, "promotion");
  },

  createPromotion: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    const response = await apiClient.post("/admin/promotions", payload);
    return requireObject(response, "created promotion");
  },

  updatePromotion: async (id: string, payload: UpdatePromotionPayload): Promise<Promotion> => {
    const response = await apiClient.patch(`/admin/promotions/${id}`, payload);
    return requireObject(response, "updated promotion");
  },

  deletePromotion: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promotions/${id}`);
  }
};
