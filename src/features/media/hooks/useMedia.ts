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

function getErrorMessage(err: any, fallback: string): string {
  const raw = err?.message || err?.response?.data?.message || err?.data?.message;
  if (Array.isArray(raw)) {
    return raw.filter(Boolean).join(", ");
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw;
  }
  return fallback;
}

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
      toast.error(getErrorMessage(err, "Failed to upload media."));
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
      toast.error(getErrorMessage(err, "Failed to upload multiple images."));
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
      toast.error(getErrorMessage(err, "Failed to import images from URLs."));
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
      toast.error(getErrorMessage(err, "Failed to update media."));
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
      toast.error(getErrorMessage(err, "Failed to move media assets."));
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
      toast.error(getErrorMessage(err, "Failed to create category."));
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
      toast.error(getErrorMessage(err, "Failed to update category."));
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
      toast.error(getErrorMessage(err, "Failed to delete category."));
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
      toast.error(getErrorMessage(err, "Failed to delete media."));
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
      toast.error(getErrorMessage(err, "Failed to assign to showcase."));
    },
  });
}

export function useAssignBulkShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payloads: AssignShowcasePayload[]) => {
      const results = [];
      for (const payload of payloads) {
        const res = await mediaApi.assignShowcase(payload);
        results.push(res);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.showcase() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to assign items to showcase."));
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
      toast.error(getErrorMessage(err, "Failed to update showcase item."));
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
      toast.error(getErrorMessage(err, "Failed to reorder showcase."));
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
      toast.error(getErrorMessage(err, "Failed to remove from showcase."));
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
      toast.error(getErrorMessage(err, "Failed to upload video."));
    },
  });
}

export function useOptimizeAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OptimizeAssetPayload }) =>
      mediaApi.optimizeAsset(id, payload),
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Asset optimized with WebP URL successfully.");
      return updatedAsset;
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, "Failed to optimize asset."));
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
      toast.error(getErrorMessage(err, "Failed to sync entities."));
    },
  });
}
