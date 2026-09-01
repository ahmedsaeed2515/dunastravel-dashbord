import { apiClient } from "@/lib/axios";
import {
  Review,
  ReviewQueryFilters,
  PaginatedResponse,
  CreateReviewDraft,
  UpdateReviewDraft,
  ReviewStatus,
} from "../types";

export const reviewsApi = {
  getReviews: async (filters?: ReviewQueryFilters): Promise<PaginatedResponse<Review>> => {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.tourId) params.tourId = filters.tourId;
      if (filters.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters.isPublished !== undefined) params.isPublished = filters.isPublished;
      if (filters.rating) params.rating = filters.rating;
      if (filters.search) params.search = filters.search;
    }
    return apiClient.get<PaginatedResponse<Review>, PaginatedResponse<Review>>("/admin/reviews", { params });
  },

  updateReviewStatus: async (
    id: string,
    status: ReviewStatus,
    isPublished?: boolean
  ): Promise<Review> => {
    return apiClient.patch<Review, Review>(`/admin/reviews/${id}/status`, {
      status,
      isPublished: isPublished !== undefined ? isPublished : status === 'APPROVED',
    });
  },

  batchUpdateReviewStatus: async (
    reviewIds: string[],
    status: ReviewStatus,
    isPublished?: boolean
  ): Promise<{ success: boolean; count: number; status: string; isPublished: boolean }> => {
    return apiClient.patch("/admin/reviews/batch/status", {
      reviewIds,
      status,
      isPublished: isPublished !== undefined ? isPublished : status === "APPROVED",
    });
  },

  publishReview: async (id: string): Promise<Review> => {
    return apiClient.patch<Review, Review>(`/admin/reviews/${id}/status`, {
      status: "APPROVED",
      isPublished: true,
    });
  },

  rejectReview: async (id: string): Promise<Review> => {
    return apiClient.patch<Review, Review>(`/admin/reviews/${id}/status`, {
      status: "REJECTED",
      isPublished: false,
    });
  },

  replyToReview: async (id: string, reply: string): Promise<Review> => {
    return apiClient.post<Review, Review>(`/admin/reviews/${id}/reply`, {
      adminReply: reply,
    });
  },

  createReview: async (draft: CreateReviewDraft): Promise<Review> => {
    return apiClient.post<Review, Review>("/admin/reviews", draft);
  },

  updateReview: async (id: string, draft: Partial<UpdateReviewDraft>): Promise<Review> => {
    return apiClient.put<Review, Review>(`/admin/reviews/${id}`, draft);
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },
};
