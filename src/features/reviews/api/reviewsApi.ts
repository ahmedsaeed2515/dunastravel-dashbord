import { apiClient } from "@/lib/axios";
import { Review, ReviewQueryFilters, PaginatedResponse, ReviewStatus } from "../types";
import { requireObject, requirePaginated } from "@/lib/api-response";

export const reviewsApi = {
  getReviews: async (filters: ReviewQueryFilters = {}): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get("/admin/reviews", { params: filters });
    return requirePaginated(response, "reviews");
  },

  updateStatus: async (id: string, status: ReviewStatus): Promise<Review> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/status`, { status });
    return requireObject(response, "updated review");
  },

  publishReview: async (id: string): Promise<Review> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/status`, { status: "APPROVED" });
    return requireObject(response, "published review");
  },

  rejectReview: async (id: string): Promise<Review> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/status`, { status: "REJECTED" });
    return requireObject(response, "rejected review");
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  replyToReview: async (id: string, reply: string): Promise<Review> => {
    const response = await apiClient.post(`/admin/reviews/${id}/reply`, { reply });
    return requireObject(response, "review reply");
  }
};
