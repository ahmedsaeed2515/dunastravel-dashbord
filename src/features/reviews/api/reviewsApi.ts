import { apiClient } from "@/lib/axios";
import { Review, ReviewQueryFilters, PaginatedResponse } from "../types";

export const reviewsApi = {
  getReviews: async (filters: ReviewQueryFilters): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get("/admin/reviews", { params: filters });
    return response as any;
  },

  publishReview: async (id: string): Promise<Review> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/publish`);
    return response as any;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  replyToReview: async (id: string, reply: string): Promise<Review> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/reply`, { reply });
    return response as any;
  }
};
