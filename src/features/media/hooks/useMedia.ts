import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../api/mediaApi";
import { MediaQueryFilters, UploadMediaPayload } from "../types";
import { toast } from "sonner";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaQueryFilters) => [...mediaKeys.lists(), filters] as const,
};

export function useMediaAssets(filters: MediaQueryFilters) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => mediaApi.getMediaAssets(filters),
    placeholderData: (prev) => prev,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadMediaPayload) => mediaApi.uploadMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Media uploaded successfully.");
    },
    onError: () => toast.error("Failed to upload media."),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Media deleted successfully.");
    },
    onError: () => toast.error("Failed to delete media."),
  });
}
