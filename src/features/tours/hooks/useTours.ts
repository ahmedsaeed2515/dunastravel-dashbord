/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toursApi } from "../api/toursApi";
import { TourQueryFilters, CreateTourPayload, UpdateTourPayload, BulkUpdateToursPayload } from "../types";
import { toast } from "sonner";

export function useTours(filters: TourQueryFilters) {
  return useQuery({
    queryKey: ["tours", filters],
    queryFn: () => toursApi.getTours(filters),
  });
}

export function useTourStats() {
  return useQuery({
    queryKey: ["tours", "stats"],
    queryFn: () => toursApi.getTourStats(),
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: ["tours", slug],
    queryFn: () => toursApi.getTourBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTourPayload) => toursApi.createTour(data),
    onSuccess: () => {
      toast.success("Tour created successfully");
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create tour");
    },
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateTourPayload }) => toursApi.updateTour(slug, data),
    onSuccess: (data, variables) => {
      toast.success("Tour updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update tour");
    },
  });
}

export function useBulkUpdateTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateToursPayload) => toursApi.bulkUpdateTours(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} tours successfully`);
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to bulk update tours");
    },
  });
}

export function useSoftDeleteTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => toursApi.softDeleteTour(slug),
    onSuccess: () => {
      toast.success("Tour deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete tour");
    },
  });
}

export function useAddTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) => toursApi.addTourItinerary(slug, data),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day added successfully");
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to add itinerary day"),
  });
}

export function useUpdateTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, dayId, data }: { slug: string; dayId: string; data: any }) => toursApi.updateTourItinerary(slug, dayId, data),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to update itinerary day"),
  });
}

export function useRemoveTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, dayId }: { slug: string; dayId: string }) => toursApi.removeTourItinerary(slug, dayId),
    onSuccess: (_, variables) => {
      toast.success("Itinerary day removed successfully");
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to remove itinerary day"),
  });
}

export function useAddTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) => toursApi.addTourImage(slug, data),
    onSuccess: (_, variables) => {
      toast.success("Image added successfully");
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to add image"),
  });
}

  export function useRemoveTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, imageId }: { slug: string; imageId: string }) => toursApi.removeTourImage(slug, imageId),
    onSuccess: (_, variables) => {
      toast.success("Image removed successfully");
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to remove image"),
  });
}

export function useReorderTourImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, imageId, data }: { slug: string; imageId: string; data: { newOrder: number } }) => toursApi.reorderTourImage(slug, imageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tours", variables.slug] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to reorder image"),
  });
}
