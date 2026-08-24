import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { landingPagesApi, LandingPageFilters, LandingPageMutationPayload } from "../api/landingPagesApi";

export const LANDING_PAGES_QUERY_KEY = ["admin", "tour-landing-pages"];

export function useLandingPages(filters?: LandingPageFilters) {
  return useQuery({
    queryKey: [...LANDING_PAGES_QUERY_KEY, filters],
    queryFn: () => landingPagesApi.getLandingPages(filters),
  });
}

export function useLandingPage(slug: string) {
  return useQuery({
    queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug],
    queryFn: () => landingPagesApi.getLandingPageBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LandingPageMutationPayload) => landingPagesApi.createLandingPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
    },
  });
}

export function useUpdateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: LandingPageMutationPayload }) =>
      landingPagesApi.updateLandingPage(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function usePublishLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => landingPagesApi.publishLandingPage(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useUnpublishLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => landingPagesApi.unpublishLandingPage(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useArchiveLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => landingPagesApi.archiveLandingPage(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => landingPagesApi.deleteLandingPage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
    },
  });
}

export function useAttachToursToLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, tourIds }: { slug: string; tourIds: string[] }) =>
      landingPagesApi.attachTours(slug, { tourIds }),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useDetachTourFromLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, tourId }: { slug: string; tourId: string }) =>
      landingPagesApi.detachTour(slug, tourId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useUpdateLandingPageTourRelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, tourId, data }: { slug: string; tourId: string; data: { sortOrder?: number; isFeatured?: boolean; isVisible?: boolean; customBadge?: Record<string, string> } }) =>
      landingPagesApi.updateTourRelation(slug, tourId, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useReorderLandingPageTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, items }: { slug: string; items: { tourId: string; sortOrder: number }[] }) =>
      landingPagesApi.reorderToursInLandingPage(slug, items),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LANDING_PAGES_QUERY_KEY, "detail", slug] });
    },
  });
}

export function useReorderLandingPages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) => landingPagesApi.reorderLandingPages(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LANDING_PAGES_QUERY_KEY }),
  });
}
