import { apiClient } from "@/lib/axios";
import {
  User,
  UserQueryFilters,
  UserMonitoringMetrics,
  UserMonitoringDetail,
  LiveActivityItem,
} from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { UserFormValues } from "../schemas/user.schema";

export const usersApi = {
  getUsers: async (filters: UserQueryFilters): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>, PaginatedResponse<User>>("/admin/users", {
      params: filters,
    });
  },

  getMonitoringOverview: async (): Promise<UserMonitoringMetrics> => {
    return apiClient.get<UserMonitoringMetrics, UserMonitoringMetrics>(
      "/admin/users/monitoring/overview"
    );
  },

  getUserMonitoringDetail: async (id: string): Promise<UserMonitoringDetail> => {
    return apiClient.get<UserMonitoringDetail, UserMonitoringDetail>(
      `/admin/users/${id}/monitoring`
    );
  },

  getLiveActivityStream: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    userId?: string;
    search?: string;
  }): Promise<PaginatedResponse<LiveActivityItem>> => {
    return apiClient.get<PaginatedResponse<LiveActivityItem>, PaginatedResponse<LiveActivityItem>>(
      "/admin/users/monitoring/live-stream",
      { params }
    );
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

  revokeSessions: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }, { success: boolean }>(
      `/admin/users/${id}/revoke-sessions`
    );
  },

  addUserNote: async (
    id: string,
    content: string,
    noteType = "MONITORING",
    isPinned = false
  ): Promise<any> => {
    return apiClient.post(`/admin/users/${id}/notes`, {
      content,
      noteType,
      isPinned,
    });
  },
};
