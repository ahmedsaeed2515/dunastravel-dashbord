import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "../api/contentApi";
import { UpdateContentBlockDto } from "../types";
import { toast } from "sonner";

export function useContentBlocks() {
  return useQuery({
    queryKey: ["content-blocks"],
    queryFn: () => contentApi.getBlocks(),
  });
}

export function useUpdateContentBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: UpdateContentBlockDto }) => 
      contentApi.updateBlock(key, payload),
    onSuccess: () => {
      toast.success("Content updated successfully");
      queryClient.invalidateQueries({ queryKey: ["content-blocks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update content");
    },
  });
}

export function useSeedDefaults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contentApi.seedDefaults(),
    onSuccess: (res) => {
      toast.success(res?.message || "Default luxury content seeded successfully!");
      queryClient.invalidateQueries({ queryKey: ["content-blocks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to seed default content");
    },
  });
}

export function useDeleteContentBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => contentApi.deleteBlock(key),
    onSuccess: () => {
      toast.success("Content block removed");
      queryClient.invalidateQueries({ queryKey: ["content-blocks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete block");
    },
  });
}
