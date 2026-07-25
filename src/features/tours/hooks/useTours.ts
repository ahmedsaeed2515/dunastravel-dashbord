import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toursApi } from "../api/toursApi";
import { TourQueryFilters, CreateTourPayload, UpdateTourPayload, BulkUpdateToursPayload } from "../types";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-types";

export function useTours(filters: TourQueryFilters) {
  return useQuery({
    queryKey: queryKeys.tours.list(filters as Record<string, unknown>),
    queryFn: () => toursApi.getTours(filters),
  });
}

export function useTourStats() {
  return useQuery({
    queryKey: queryKeys.tours.stats(),
    queryFn: () => toursApi.getTourStats(),
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: queryKeys.tours.detail(slug),
    queryFn: () => toursApi.getTourBySlug(slug),
    enabled: Boolean(slug),
  });
}

export const useTourBySlug = useTour;

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTourPayload) => toursApi.createTour(data),
    onSuccess: () => {
      toast.success("Tour created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create tour");
    },
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateTourPayload }) =>
      toursApi.updateTour(slug, data),
    onSuccess: (_, variables) => {
      toast.success("Tour updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update tour");
    },
  });
}

export function useBulkUpdateTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateToursPayload) => toursApi.bulkUpdateTours(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} tours successfully`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to bulk update tours");
    },
  });
}

export function useSoftDeleteTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => toursApi.softDeleteTour(slug),
    onSuccess: () => {
      toast.success("Tour deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete tour");
    },
  });
}

export function useAddTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: unknown }) =>
      toursApi.addTourItinerary(slug, data),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) =>
      toast.error(error?.message || "Failed to add itinerary day"),
  });
}

export function useUpdateTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, dayId, data }: { slug: string; dayId: string; data: unknown }) =>
      toursApi.updateTourItinerary(slug, dayId, data),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) =>
      toast.error(error?.message || "Failed to update itinerary day"),
  });
}

export function useRemoveTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, dayId }: { slug: string; dayId: string }) =>
      toursApi.removeTourItinerary(slug, dayId),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day removed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) =>
      toast.error(error?.message || "Failed to remove itinerary day"),
  });
}

export function useAddTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: unknown }) =>
      toursApi.addTourImage(slug, data),
    onSuccess: (_, variables) => {
      toast.success("Image added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to add image"),
  });
}

export function useRemoveTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, imageId }: { slug: string; imageId: string }) =>
      toursApi.removeTourImage(slug, imageId),
    onSuccess: (_, variables) => {
      toast.success("Image removed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to remove image"),
  });
}

export function useReorderTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      imageId,
      data,
    }: {
      slug: string;
      imageId: string;
      data: { newOrder: number };
    }) => toursApi.reorderTourImage(slug, imageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to reorder image"),
  });
}
