import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../api/mediaApi";
import { 
  MediaQueryFilters, 
  UploadMediaPayload, 
  UploadBulkMediaPayload,
  ImportMediaUrlsPayload,
  UpdateMediaPayload, 
  BulkMoveMediaPayload,
  CreateMediaCategoryPayload,
  UpdateMediaCategoryPayload,
  AssignShowcasePayload,
  UpdateShowcaseItemPayload,
  ReorderShowcasePayload,
  UploadVideoPayload,
  OptimizeAssetPayload,
} from "../types";
import { toast } from "sonner";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaQueryFilters) => [...mediaKeys.lists(), filters] as const,
  categories: () => [...mediaKeys.all, "categories"] as const,
  summary: () => [...mediaKeys.all, "summary"] as const,
  showcase: () => [...mediaKeys.all, "showcase"] as const,
  usage: (id: string) => [...mediaKeys.all, "usage", id] as const,
};

export function useMediaAssets(filters: MediaQueryFilters) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => mediaApi.getMediaAssets(filters),
    placeholderData: (prev) => prev,
  });
}

export function useMediaSummary() {
  return useQuery({
    queryKey: mediaKeys.summary(),
    queryFn: () => mediaApi.getSummary(),
  });
}

export function useMediaCategories() {
  return useQuery({
    queryKey: mediaKeys.categories(),
    queryFn: () => mediaApi.getCategories(),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadMediaPayload) => mediaApi.uploadMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Media uploaded successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to upload media.";
      toast.error(msg);
    },
  });
}

export function useUploadBulkMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadBulkMediaPayload) => mediaApi.uploadBulkMedia(data),
    onSuccess: (assets) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`Successfully uploaded ${assets.length} image(s).`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to upload multiple images.";
      toast.error(msg);
    },
  });
}

export function useImportMediaUrls() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportMediaUrlsPayload) => mediaApi.importMediaUrls(data),
    onSuccess: (assets) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`Successfully imported ${assets.length} image(s) from URLs.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to import images from URLs.";
      toast.error(msg);
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMediaPayload }) => mediaApi.updateMedia(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Media details updated successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update media.";
      toast.error(msg);
    },
  });
}

export function useBulkMoveMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkMoveMediaPayload) => mediaApi.bulkMoveMedia(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`Successfully moved ${res.updatedCount} media assets.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to move media assets.";
      toast.error(msg);
    },
  });
}

export function useCreateMediaCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMediaCategoryPayload) => mediaApi.createCategory(payload),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.categories() });
      toast.success(`Category "${cat.nameEn}" created successfully.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create category.";
      toast.error(msg);
    },
  });
}

export function useUpdateMediaCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: UpdateMediaCategoryPayload }) => mediaApi.updateCategory(slug, payload),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.categories() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success(`Category "${cat.nameEn}" updated successfully.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update category.";
      toast.error(msg);
    },
  });
}

export function useDeleteMediaCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => mediaApi.deleteCategory(slug),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(res.message || "Category deleted successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete category.";
      toast.error(msg);
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Media deleted successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete media.";
      toast.error(msg);
    },
  });
}

export function useShowcaseMedia() {
  return useQuery({
    queryKey: mediaKeys.showcase(),
    queryFn: () => mediaApi.getShowcase(),
  });
}

export function useAssignShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignShowcasePayload) => mediaApi.assignShowcase(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Item added to homepage showcase.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to assign to showcase.";
      toast.error(msg);
    },
  });
}

export function useUpdateShowcaseItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShowcaseItemPayload }) =>
      mediaApi.updateShowcaseItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      toast.success("Showcase item updated.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update showcase item.";
      toast.error(msg);
    },
  });
}

export function useReorderShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderShowcasePayload) => mediaApi.reorderShowcase(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      toast.success("Showcase reordered successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to reorder showcase.";
      toast.error(msg);
    },
  });
}

export function useRemoveFromShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.removeFromShowcase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Removed from showcase.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to remove from showcase.";
      toast.error(msg);
    },
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadVideoPayload) => mediaApi.uploadVideo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Video uploaded successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to upload video.";
      toast.error(msg);
    },
  });
}

export function useOptimizeAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OptimizeAssetPayload }) =>
      mediaApi.optimizeAsset(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Asset optimized with WebP URL successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to optimize asset.";
      toast.error(msg);
    },
  });
}

export function useMediaUsage(id: string | null) {
  return useQuery({
    queryKey: id ? mediaKeys.usage(id) : ["media", "usage", "none"],
    queryFn: () => (id ? mediaApi.getMediaUsage(id) : null),
    enabled: !!id,
  });
}

export function useSyncEntities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mediaApi.syncEntities(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`Entities synced. ${res.syncedTourImages} tour images registered.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to sync entities.";
      toast.error(msg);
    },
  });
}
