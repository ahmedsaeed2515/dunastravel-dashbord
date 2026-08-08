import { apiClient } from "@/lib/axios";

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
  metadata?: any;
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

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; category?: string; isRead?: string }): Promise<ListInAppNotificationsResponse> => {
    const response: any = await apiClient.get("/in-app-notifications", { params });
    const data = response?.data || response;
    return {
      items: Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [],
      unreadCount: typeof data?.unreadCount === "number" ? data.unreadCount : 0,
      meta: data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response: any = await apiClient.get("/in-app-notifications/unread-count");
    const data = response?.data || response;
    return typeof data?.unreadCount === "number" ? data.unreadCount : 0;
  },

  markAsRead: async (id: string): Promise<InAppNotificationItem> => {
    const response: any = await apiClient.patch(`/in-app-notifications/${id}/read`);
    return response?.data || response;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const response: any = await apiClient.patch("/in-app-notifications/read-all");
    return response?.data || response;
  },
};
