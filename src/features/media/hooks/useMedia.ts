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
} from "../types";
import { toast } from "sonner";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaQueryFilters) => [...mediaKeys.lists(), filters] as const,
  categories: () => [...mediaKeys.all, "categories"] as const,
  summary: () => [...mediaKeys.all, "summary"] as const,
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
