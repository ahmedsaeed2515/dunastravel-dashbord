export type NotificationDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'EXHAUSTED';

export interface NotificationDeliveryLog {
  id: string;
  notificationType: string;
  originReferenceCode: string;
  originEntityType: string;
  recipientEmail: string;
  status: NotificationDeliveryStatus;
  attempts: number;
  lastAttemptAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationMetrics {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number; // Percentage
}

export interface NotificationDeliveryLogQueryFilters {
  page?: number;
  limit?: number;
  status?: NotificationDeliveryStatus;
  notificationType?: string;
  recipientEmail?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
