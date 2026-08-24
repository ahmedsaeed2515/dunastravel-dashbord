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
    return apiClient.get<PaginatedResponse<Promotion>, PaginatedResponse<Promotion>>("/admin/promotions", { params: filters });
  },

  getPromotionById: async (id: string): Promise<Promotion> => {
    return apiClient.get<Promotion, Promotion>(`/admin/promotions/${id}`);
  },

  createPromotion: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    return apiClient.post<Promotion, Promotion>("/admin/promotions", payload);
  },

  updatePromotion: async (id: string, payload: UpdatePromotionPayload): Promise<Promotion> => {
    return apiClient.patch<Promotion, Promotion>(`/admin/promotions/${id}`, payload);
  },

  deletePromotion: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promotions/${id}`);
  }
};
