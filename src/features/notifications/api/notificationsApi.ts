import { apiClient } from "@/lib/axios";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface InAppNotificationItem {
  id: string;
  userId: string;
  category: "BOOKING" | "PAYMENT" | "INQUIRY" | "TOUR" | "WALLET" | "COMMISSION" | "SYSTEM";
  priority: "NORMAL" | "HIGH" | "URGENT";
  title: string;
  message: string;
  targetApp: string;
  entityType?: string;
  entityId?: string;
  deepLink?: string;
  metadata?: JsonValue | null;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ListInAppNotificationsResponse {
  items: InAppNotificationItem[];
  unreadCount: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export interface MarkAllNotificationsReadResponse {
  count: number;
}

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; category?: string; isRead?: string }): Promise<ListInAppNotificationsResponse> => {
    return apiClient.get<ListInAppNotificationsResponse, ListInAppNotificationsResponse>("/in-app-notifications", { params });
  },

  getUnreadCount: async (): Promise<number> => {
    const result = await apiClient.get<UnreadNotificationCountResponse, UnreadNotificationCountResponse>("/in-app-notifications/unread-count");
    return result.unreadCount;
  },

  markAsRead: async (id: string): Promise<InAppNotificationItem> => {
    return apiClient.patch<InAppNotificationItem, InAppNotificationItem>(`/in-app-notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<MarkAllNotificationsReadResponse> => {
    return apiClient.patch<MarkAllNotificationsReadResponse, MarkAllNotificationsReadResponse>("/in-app-notifications/read-all");
  },
};
