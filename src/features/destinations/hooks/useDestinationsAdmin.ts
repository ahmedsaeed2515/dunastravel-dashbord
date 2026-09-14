import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  destinationsApi,
  DestinationFilters,
  DestinationItem,
  DestinationMutationPayload,
} from "../api/destinationsApi";
import { PaginatedResponse } from "@/lib/api-types";
import { toast } from "sonner";

export const DESTINATIONS_ADMIN_KEY = ["admin", "destinations"];

export function useAdminDestinations(filters?: DestinationFilters) {
  return useQuery<PaginatedResponse<DestinationItem>, Error>({
    queryKey: [...DESTINATIONS_ADMIN_KEY, filters],
    queryFn: () => destinationsApi.getDestinations(filters),
    staleTime: 30_000,
  });
}

export function useAdminDestination(idOrSlug: string | null | undefined) {
  return useQuery<DestinationItem, Error>({
    queryKey: [...DESTINATIONS_ADMIN_KEY, idOrSlug],
    queryFn: () => destinationsApi.getDestinationBySlug(idOrSlug!),
    enabled: Boolean(idOrSlug),
    staleTime: 10_000,
  });
}

export function useCreateDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, DestinationMutationPayload>({
    mutationFn: (data) => destinationsApi.createDestination(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success(
        `تم إنشاء وجهة ${newItem.titleJsonb?.ar || newItem.titleJsonb?.en || newItem.slug} بنجاح!`
      );
    },
    onError: (err) => {
      toast.error(err?.message || "فشل إنشاء الوجهة الجديدة.");
    },
  });
}

export function useUpdateDestination() {
  const queryClient = useQueryClient();
  return useMutation<
    DestinationItem,
    Error,
    { idOrSlug: string; data: DestinationMutationPayload }
  >({
    mutationFn: ({ idOrSlug, data }) =>
      destinationsApi.updateDestination(idOrSlug, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success(
        `تم تحديث وجهة ${updated.titleJsonb?.ar || updated.titleJsonb?.en || updated.slug} بنجاح!`
      );
    },
    onError: (err) => {
      toast.error(err?.message || "فشل تحديث بيانات الوجهة.");
    },
  });
}

export function usePublishDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.publishDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم نشر الوجهة بنجاح على الموقع!");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر نشر الوجهة.");
    },
  });
}

export function useUnpublishDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.unpublishDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم تحويل الوجهة إلى مسودة (غير منشورة).");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر إلغاء نشر الوجهة.");
    },
  });
}

export function useActivateDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.activateDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم تفعيل الوجهة بنجاح.");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر تفعيل الوجهة.");
    },
  });
}

export function useDeactivateDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.deactivateDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم إيقاف تفعيل الوجهة.");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر إيقاف تفعيل الوجهة.");
    },
  });
}

export function useArchiveDestination() {
  const queryClient = useQueryClient();
  return useMutation<DestinationItem, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.archiveDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم أرشفة الوجهة بنجاح.");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر أرشفة الوجهة.");
    },
  });
}

export function useDeleteDestination() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (idOrSlug) => destinationsApi.deleteDestination(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم حذف الوجهة بنجاح (مع الحفاظ على رحلات الكتالوج).");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر حذف الوجهة.");
    },
  });
}

export function useReorderDestinations() {
  const queryClient = useQueryClient();
  return useMutation<{ success: true; count: number }, Error, { id: string; sortOrder: number }[]>({
    mutationFn: (items) => destinationsApi.reorderDestinations(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم تحديث ترتيب الوجهات بنجاح.");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر إعادة ترتيب الوجهات.");
    },
  });
}

export function useAttachToursToDestination() {
  const queryClient = useQueryClient();
  return useMutation<
    DestinationItem,
    Error,
    { idOrSlug: string; tourIds: string[]; isFeatured?: boolean; isVisible?: boolean }
  >({
    mutationFn: ({ idOrSlug, ...payload }) =>
      destinationsApi.attachTours(idOrSlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم ربط الرحلات بالوجهة بنجاح!");
    },
    onError: (err) => {
      toast.error(err?.message || "فشل ربط الرحلات بالوجهة.");
    },
  });
}

export function useDetachTourFromDestination() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { idOrSlug: string; tourId: string }>({
    mutationFn: ({ idOrSlug, tourId }) =>
      destinationsApi.detachTour(idOrSlug, tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم فك ارتباط الرحلة من الوجهة بنجاح.");
    },
    onError: (err) => {
      toast.error(err?.message || "فشل فك ارتباط الرحلة.");
    },
  });
}

export function useUpdateDestinationTourRelation() {
  const queryClient = useQueryClient();
  return useMutation<
    DestinationItem,
    Error,
    {
      idOrSlug: string;
      tourId: string;
      payload: {
        sortOrder?: number;
        isFeatured?: boolean;
        isVisible?: boolean;
        customBadge?: Record<string, string>;
      };
    }
  >({
    mutationFn: ({ idOrSlug, tourId, payload }) =>
      destinationsApi.updateTourRelation(idOrSlug, tourId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم تحديث خصائص الرحلة داخل الوجهة.");
    },
    onError: (err) => {
      toast.error(err?.message || "فشل تحديث خصائص الرحلة.");
    },
  });
}

export function useReorderDestinationTours() {
  const queryClient = useQueryClient();
  return useMutation<
    DestinationItem,
    Error,
    { idOrSlug: string; items: { tourId?: string; slug?: string; sortOrder: number }[] }
  >({
    mutationFn: ({ idOrSlug, items }) =>
      destinationsApi.reorderToursInDestination(idOrSlug, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESTINATIONS_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("تم تحديث ترتيب الرحلات داخل الوجهة بنجاح.");
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر إعادة ترتيب الرحلات داخل الوجهة.");
    },
  });
}
