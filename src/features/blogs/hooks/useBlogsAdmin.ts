import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blogsApi } from "../api/blogsApi";

export function useBlogsAdmin(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["admin-blogs", params],
    queryFn: () => blogsApi.list(params),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => blogsApi.create(payload),
    onSuccess: () => {
      toast.success("Blog article published/saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to create blog article");
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idOrSlug, payload }: { idOrSlug: string; payload: any }) =>
      blogsApi.update(idOrSlug, payload),
    onSuccess: () => {
      toast.success("Blog article updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to update blog article");
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idOrSlug: string) => blogsApi.delete(idOrSlug),
    onSuccess: () => {
      toast.success("Blog article deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to delete blog article");
    },
  });
}
