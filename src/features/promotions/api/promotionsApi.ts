import { apiClient } from "@/lib/axios";
import { 
  Promotion,
  PromotionQueryFilters,
  CreatePromotionPayload,
  UpdatePromotionPayload
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

export const promotionsApi = {
  getPromotions: async (filters: PromotionQueryFilters = {}): Promise<PaginatedResponse<Promotion>> => {
    const { data } = await apiClient.get("/admin/promotions", { params: filters });
    return data;
  },

  getPromotionById: async (id: string): Promise<Promotion> => {
    const { data } = await apiClient.get(`/admin/promotions/${id}`);
    return data;
  },

  createPromotion: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    const { data } = await apiClient.post("/admin/promotions", payload);
    return data;
  },

  updatePromotion: async (id: string, payload: UpdatePromotionPayload): Promise<Promotion> => {
    const { data } = await apiClient.patch(`/admin/promotions/${id}`, payload);
    return data;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promotions/${id}`);
  }
};
