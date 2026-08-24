 
import { apiClient } from "@/lib/axios";
import { User, UserQueryFilters } from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { UserFormValues } from "../schemas/user.schema";

export const usersApi = {
  getUsers: async (filters: UserQueryFilters): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>, PaginatedResponse<User>>("/admin/users", { params: filters });
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User, User>(`/admin/users/${id}`);
  },

  createUser: async (data: UserFormValues): Promise<User> => {
    return apiClient.post<User, User>("/admin/users", data);
  },

  updateUser: async (id: string, data: Partial<UserFormValues>): Promise<User> => {
    return apiClient.patch<User, User>(`/admin/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  suspendUser: async (id: string, reason: string): Promise<User> => {
    return apiClient.post<User, User>(`/admin/users/${id}/suspend`, { reason });
  },

  activateUser: async (id: string): Promise<User> => {
    return apiClient.post<User, User>(`/admin/users/${id}/activate`);
  },
};
