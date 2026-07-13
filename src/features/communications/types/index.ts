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

export interface Inquiry {
  referenceCode: string;
  name: string;
  email: string;
  phone?: string | null;
  destinations: string[];
  departureDate?: string | null;
  returnDate?: string | null;
  numberOfTravelers: number;
  specialRequests?: string | null;
  status: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  assigneeId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplatePayload {
  name: string;
  subject: string;
  bodyHtml: string;
  variables?: string[];
}

export interface UpdateEmailTemplatePayload extends Partial<CreateEmailTemplatePayload> {}
