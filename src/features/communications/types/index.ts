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

export interface InquiryMetrics {
  total: number;
  newlyReceived: number;
  inProgress: number;
  quoted: number;
  approved: number;
  converted: number;
  closed: number;
  pipelineValue: number;
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
  id: string;
  referenceCode: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  destinations: string[];
  departureDate?: string | null;
  returnDate?: string | null;
  startDate?: string | null;
  adults?: number;
  children?: number;
  numberOfTravelers?: number;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  quotedAmountUsd?: number | null;
  notes?: string | null;
  specialRequests?: string | null;
  internalNote?: string | null;
  followUpAt?: string | null;
  status: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  bookingId?: string | null;
  booking?: {
    id: string;
    referenceCode: string;
    status: string;
    totalAmountUsd: number;
  } | null;
  partnerCode?: string | null;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    referenceCode: string;
    taxId?: string;
    tier?: string;
    commissionRate?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: number;
  referenceCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  locale: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'email' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface InquiryQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  assigneeId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  designConfig?: import('./template-builder.types').EmailDesignConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplatePayload {
  name: string;
  subject: string;
  bodyHtml: string;
  variables?: string[];
}

export type UpdateEmailTemplatePayload = Partial<CreateEmailTemplatePayload>;

export * from './template-builder.types';
