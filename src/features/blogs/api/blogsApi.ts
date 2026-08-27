import { apiClient } from "@/lib/axios";
import { BlogArticle, BlogsListResponse } from "../types";

export const blogsApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<BlogsListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return apiClient.get<BlogsListResponse, BlogsListResponse>(`/admin/blogs${qs ? `?${qs}` : ""}`);
  },

  getById: async (idOrSlug: string): Promise<BlogArticle> => {
    return apiClient.get<BlogArticle, BlogArticle>(`/admin/blogs/${idOrSlug}`);
  },

  create: async (payload: any): Promise<BlogArticle> => {
    return apiClient.post<BlogArticle, BlogArticle>("/admin/blogs", payload);
  },

  update: async (idOrSlug: string, payload: any): Promise<BlogArticle> => {
    return apiClient.put<BlogArticle, BlogArticle>(`/admin/blogs/${idOrSlug}`, payload);
  },

  delete: async (idOrSlug: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }, { success: boolean }>(`/admin/blogs/${idOrSlug}`);
  },
};
