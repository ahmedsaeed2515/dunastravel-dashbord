 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviewsApi";
import {
  ReviewQueryFilters,
  CreateReviewDraft,
  UpdateReviewDraft,
  ReviewStatus,
} from "../types";
import { toast } from "sonner";

export function useReviews(filters?: ReviewQueryFilters) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => reviewsApi.getReviews(filters),
    staleTime: 30_000,
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      isPublished,
    }: {
      id: string;
      status: ReviewStatus;
      isPublished?: boolean;
    }) => reviewsApi.updateReviewStatus(id, status, isPublished),
    onSuccess: (updated) => {
      toast.success(
        updated.isPublished
          ? "Review approved and published live"
          : "Review status updated"
      );
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update review status"
      );
    },
  });
}

export function useBatchUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewIds,
      status,
      isPublished,
    }: {
      reviewIds: string[];
      status: ReviewStatus;
      isPublished?: boolean;
    }) => reviewsApi.batchUpdateReviewStatus(reviewIds, status, isPublished),
    onSuccess: (data) => {
      toast.success(
        data.status === "APPROVED"
          ? `تم اعتماد ونشر ${data.count} مراجعة بنجاح! ✨`
          : `تم تحديث حالة ${data.count} مراجعة بنجاح!`
      );
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "فشل التحديث الجماعي للمراجعات"
      );
    },
  });
}

export function usePublishReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.publishReview(id),
    onSuccess: () => {
      toast.success("Review approved and published live");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to publish review"
      );
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.rejectReview(id),
    onSuccess: () => {
      toast.success("Review rejected and hidden from public");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject review"
      );
    },
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      reviewsApi.replyToReview(id, reply),
    onSuccess: () => {
      toast.success("Admin reply posted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to post admin reply"
      );
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: CreateReviewDraft) => reviewsApi.createReview(draft),
    onSuccess: () => {
      toast.success("Review added successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create review"
      );
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      draft,
    }: {
      id: string;
      draft: Partial<UpdateReviewDraft>;
    }) => reviewsApi.updateReview(id, draft),
    onSuccess: () => {
      toast.success("Review details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update review"
      );
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      toast.success("Review removed successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete review"
      );
    },
  });
}

