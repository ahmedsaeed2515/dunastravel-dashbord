import { apiClient } from "@/lib/axios";
import {
  User,
  UserQueryFilters,
  UserMonitoringMetrics,
  UserMonitoringDetail,
  LiveActivityItem,
} from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { UserFormValues, UpdateUserFormValues } from "../schemas/user.schema";

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
    const payload = { ...data };
    if (typeof payload.phone === "string" && payload.phone.trim() === "") {
      delete payload.phone;
    }
    return apiClient.post<User, User>("/admin/users", payload);
  },

  updateUser: async (id: string, data: Partial<UserFormValues | UpdateUserFormValues>): Promise<User> => {
    const payload = { ...data };
    delete (payload as any).confirmPassword;
    if (typeof payload.password === "string" && payload.password.trim() === "") {
      delete payload.password;
    }
    try {
      return await apiClient.patch<User, User>(`/admin/users/${id}`, payload);
    } catch {
      try {
        return await apiClient.put<User, User>(`/admin/users/${id}`, payload);
      } catch {
        return await apiClient.post<User, User>(`/admin/users/${id}`, payload);
      }
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  suspendUser: async (id: string, reason?: string): Promise<User> => {
    const finalReason = reason && reason.trim() ? reason.trim() : "تم إيقاف الحساب بواسطة مدير النظام";
    try {
      return await apiClient.post<User, User>(`/admin/users/${id}/suspend`, { reason: finalReason });
    } catch {
      try {
        return await apiClient.patch<User, User>(`/admin/users/${id}/suspend`, { reason: finalReason });
      } catch {
        return await apiClient.patch<User, User>(`/admin/users/${id}`, {
          status: "SUSPENDED",
          statusReason: finalReason,
          reason: finalReason,
        } as any);
      }
    }
  },

  activateUser: async (id: string): Promise<User> => {
    try {
      return await apiClient.post<User, User>(`/admin/users/${id}/activate`);
    } catch {
      try {
        return await apiClient.patch<User, User>(`/admin/users/${id}/activate`);
      } catch {
        return await apiClient.patch<User, User>(`/admin/users/${id}`, {
          status: "ACTIVE",
        } as any);
      }
    }
  },

  revokeSessions: async (id: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post<{ success: boolean }, { success: boolean }>(
        `/admin/users/${id}/revoke-sessions`
      );
    } catch {
      try {
        return await apiClient.delete<{ success: boolean }, { success: boolean }>(
          `/admin/users/${id}/sessions`
        );
      } catch {
        return await apiClient.post<{ success: boolean }, { success: boolean }>(
          `/admin/users/${id}/sessions/revoke`
        );
      }
    }
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
