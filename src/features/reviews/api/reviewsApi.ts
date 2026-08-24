import { apiClient } from "@/lib/axios";
import { Review, ReviewQueryFilters, PaginatedResponse } from "../types";

export const reviewsApi = {
  getReviews: async (filters: ReviewQueryFilters): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>, PaginatedResponse<Review>>("/admin/reviews", { params: filters });
  },

  publishReview: async (id: string): Promise<Review> => {
    return apiClient.patch<Review, Review>(`/admin/reviews/${id}/status`, { status: "APPROVED", isPublished: true });
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  replyToReview: async (id: string, reply: string): Promise<Review> => {
    return apiClient.post<Review, Review>(`/admin/reviews/${id}/reply`, { adminReply: reply });
  }
};
