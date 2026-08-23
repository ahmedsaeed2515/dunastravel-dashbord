 
import { apiClient } from "@/lib/axios";
import { User, UserQueryFilters } from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { UserFormValues } from "../schemas/user.schema";
import { requireObject, requirePaginated } from "@/lib/api-response";

export const usersApi = {
  getUsers: async (filters: UserQueryFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>("/admin/users", { params: filters });
    return requirePaginated(response, "users");
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return requireObject(response, "user");
  },

  createUser: async (data: UserFormValues): Promise<User> => {
    const response = await apiClient.post<User>("/admin/users", data);
    return requireObject(response, "created user");
  },

  updateUser: async (id: string, data: Partial<UserFormValues>): Promise<User> => {
    const response = await apiClient.patch<User>(`/admin/users/${id}`, data);
    return requireObject(response, "updated user");
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  suspendUser: async (id: string, reason: string): Promise<User> => {
    const response = await apiClient.post<User>(`/admin/users/${id}/suspend`, { reason });
    return requireObject(response, "suspended user");
  },

  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/admin/users/${id}/activate`);
    return requireObject(response, "activated user");
  },
};
