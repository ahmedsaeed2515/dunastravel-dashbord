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
    if (!data || !Array.isArray(data.items) || typeof data.unreadCount !== "number" || !data.meta) {
      throw new Error("Invalid notifications response");
    }
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response: any = await apiClient.get("/in-app-notifications/unread-count");
    const data = response?.data || response;
    if (typeof data?.unreadCount !== "number") throw new Error("Invalid unread count response");
    return data.unreadCount;
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
