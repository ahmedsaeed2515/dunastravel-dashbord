import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviewsApi";
import { ReviewQueryFilters, ReviewStatus } from "../types";
import { toast } from "sonner";

export function useReviews(filters: ReviewQueryFilters = {}) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => reviewsApi.getReviews(filters),
  });
}

export function usePublishReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.publishReview(id),
    onSuccess: () => {
      toast.success("Review approved and published successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to publish review");
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.rejectReview(id),
    onSuccess: () => {
      toast.success("Review rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to reject review");
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete review");
    },
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => reviewsApi.replyToReview(id, reply),
    onSuccess: () => {
      toast.success("Reply posted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to post reply");
    },
  });
}
