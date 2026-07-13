import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsApi } from "../api/promotionsApi";
import { PromotionQueryFilters, CreatePromotionPayload, UpdatePromotionPayload } from "../types";
import { toast } from "sonner";

export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (filters: PromotionQueryFilters) => [...promotionKeys.lists(), filters] as const,
  details: () => [...promotionKeys.all, "detail"] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
};

export function usePromotions(filters: PromotionQueryFilters) {
  return useQuery({
    queryKey: promotionKeys.list(filters),
    queryFn: () => promotionsApi.getPromotions(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePromotion(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionsApi.getPromotionById(id),
    enabled: options?.enabled,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePromotionPayload) => promotionsApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success("Promotion created successfully.");
    },
    onError: () => toast.error("Failed to create promotion."),
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionPayload }) => promotionsApi.updatePromotion(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success("Promotion updated successfully.");
    },
    onError: () => toast.error("Failed to update promotion."),
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success("Promotion deleted successfully.");
    },
    onError: () => toast.error("Failed to delete promotion."),
  });
}
