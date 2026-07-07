import { apiClient } from "@/lib/axios";
import { Review, ReviewQueryFilters, PaginatedResponse } from "../types";

export const reviewsApi = {
  getReviews: async (filters: ReviewQueryFilters): Promise<PaginatedResponse<Review>> => {
    const { data } = await apiClient.get("/admin/reviews", { params: filters });
    return data;
  },

  publishReview: async (id: string): Promise<Review> => {
    const { data } = await apiClient.patch(`/admin/reviews/${id}/publish`);
    return data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  replyToReview: async (id: string, reply: string): Promise<Review> => {
    const { data } = await apiClient.patch(`/admin/reviews/${id}/reply`, { reply });
    return data;
  }
};
