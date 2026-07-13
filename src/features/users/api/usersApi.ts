/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/axios";
import { User, UserQueryFilters } from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { UserFormValues } from "../schemas/user.schema";

export const usersApi = {
  getUsers: async (filters: UserQueryFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>("/admin/users", { params: filters });
    return response as any;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return response as any;
  },

  createUser: async (data: UserFormValues): Promise<User> => {
    const response = await apiClient.post<User>("/admin/users", data);
    return response as any;
  },

  updateUser: async (id: string, data: Partial<UserFormValues>): Promise<User> => {
    const response = await apiClient.patch<User>(`/admin/users/${id}`, data);
    return response as any;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  suspendUser: async (id: string, reason: string): Promise<User> => {
    const response = await apiClient.post<User>(`/admin/users/${id}/suspend`, { reason });
    return response as any;
  },

  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/admin/users/${id}/activate`);
    return response as any;
  },
};
