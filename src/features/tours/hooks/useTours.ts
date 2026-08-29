import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TourImagePayload, TourItineraryPayload, toursApi } from "../api/toursApi";
import {
  TourQueryFilters,
  CreateTourPayload,
  UpdateTourPayload,
  BulkUpdateToursPayload,
  CreateTourAvailabilityPayload,
  UpdateTourAvailabilityPayload,
} from "../types";
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

export function useTourCatalogOverview() {
  return useQuery({
    queryKey: queryKeys.tours.catalogOverview(),
    queryFn: () => toursApi.getTourCatalogOverview(),
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: queryKeys.tours.detail(slug),
    queryFn: () => toursApi.getTourBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useTourPreview(slug: string, lang: string) {
  return useQuery({
    queryKey: [...queryKeys.tours.detail(slug), 'preview', lang],
    queryFn: () => toursApi.getTourPreview(slug, lang),
    enabled: Boolean(slug && lang),
  });
}

const availabilityKey = (tourId: string) => [...queryKeys.tours.detail(tourId), 'availabilities'] as const;

export function useTourAvailabilities(tourId: string) {
  return useQuery({
    queryKey: availabilityKey(tourId),
    queryFn: () => toursApi.getTourAvailabilities(tourId),
    enabled: Boolean(tourId),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.catalogOverview() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.catalogOverview() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.catalogOverview() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.catalogOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete tour");
    },
  });
}

export function useClearAllTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toursApi.clearAllTours(),
    onSuccess: () => {
      toast.success("All tours cleared successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to clear tours");
    },
  });
}

export function useAddTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: TourItineraryPayload }) =>
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
    mutationFn: ({ slug, dayId, data }: { slug: string; dayId: string; data: Partial<TourItineraryPayload> }) =>
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
    mutationFn: ({ slug, data }: { slug: string; data: TourImagePayload }) =>
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
      data: { sortOrder: number };
    }) => toursApi.reorderTourImage(slug, imageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to reorder image"),
  });
}

export function useSetTourHeroImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, imageId }: { slug: string; imageId: string }) =>
      toursApi.setTourHeroImage(slug, imageId),
    onSuccess: (_, variables) => {
      toast.success("Hero image updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.slug) });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to update hero image"),
  });
}

type TourLifecycleAction = 'publish' | 'unpublish' | 'archive' | 'unarchive';

export function useTourLifecycleAction(action: TourLifecycleAction) {
  const queryClient = useQueryClient();
  const operations = {
    publish: toursApi.publishTour,
    unpublish: toursApi.unpublishTour,
    archive: toursApi.archiveTour,
    unarchive: toursApi.unarchiveTour,
  } as const;
  return useMutation({
    mutationFn: (slug: string) => operations[action](slug),
    onSuccess: (_, slug) => {
      toast.success(`Tour ${action === 'unarchive' ? 'restored as draft' : `${action}d`} successfully`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.catalogOverview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(slug) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || `Failed to ${action} tour`);
    },
  });
}

export function useCreateTourAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, data }: { tourId: string; data: CreateTourAvailabilityPayload }) =>
      toursApi.createTourAvailability(tourId, data),
    onSuccess: (_, variables) => {
      toast.success("Departure availability created successfully");
      queryClient.invalidateQueries({ queryKey: availabilityKey(variables.tourId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.stats() });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to create departure availability"),
  });
}

export function useUpdateTourAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, id, data }: { tourId: string; id: string; data: UpdateTourAvailabilityPayload }) =>
      toursApi.updateTourAvailability(id, data),
    onSuccess: (_, variables) => {
      toast.success("Departure availability updated successfully");
      queryClient.invalidateQueries({ queryKey: availabilityKey(variables.tourId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.stats() });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to update departure availability"),
  });
}

export function useDeleteTourAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, id }: { tourId: string; id: string }) =>
      toursApi.deleteTourAvailability(id),
    onSuccess: (_, variables) => {
      toast.success("Departure availability removed successfully");
      queryClient.invalidateQueries({ queryKey: availabilityKey(variables.tourId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.stats() });
    },
    onError: (error: ApiError) => toast.error(error?.message || "Failed to remove departure availability"),
  });
}
