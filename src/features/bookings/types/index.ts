export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface Passenger {
  id?: string;
  passengerType: string;
  fullName: string;
  passportNumber?: string | null;
  passportExpiry?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string | null;
  invoiceType?: 'PERSONAL' | 'COMPANY' | string;
  companyName?: string | null;
  taxId?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status?: string;
  subtotal?: string;
  tax?: string;
  total?: string;
  currency?: string;
  dueDate?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  totalAmount?: string;
  totalAmountUsd?: string | number;
  paidAmount?: string;
  paidAmountUsd?: string | number;
  currency: string;
  passengerCount: number;
  adults?: number;
  children?: number;
  infants?: number;
  tourId: string;
  tourSlug: string;
  tourNameEn: string;
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt?: string;
  arrivalDate?: string | null;
  departureDate?: string | null;
  arrivalTime?: string | null;
  departureTime?: string | null;
  language?: string | null;
  activityType?: string | null;
  bookingType?: string;
  transportChoice?: string | null;
  notes?: string | null;
  inquiryMessage?: string | null;
  priority?: string;
  tags?: string[];
  cancellationReason?: string | null;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: string;
  } | null;
  tour?: {
    id: string;
    slug: string;
    titleJsonb?: Record<string, string> | unknown;
    subtitleJsonb?: Record<string, string> | unknown;
    category?: string | null;
    country?: string | null;
    city?: string | null;
    basePriceUsd?: string | null;
    durationJsonb?: Record<string, string> | unknown;
  } | null;
  passengers?: Passenger[];
  billingInfo?: BillingInfo | null;
  invoice?: InvoiceDetail | null;
  payments?: Payment[];
  activityLogs?: BookingActivity[];
  notesList?: BookingNote[];
  attachments?: BookingAttachment[];
}

export type BookingDetail = Booking;


export interface BookingQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  tourId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateBookingPayload {
  arrivalDate?: string;
  departureDate?: string;
  tags?: string[];
  priority?: string;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
  reason?: string;
}

export interface UpsertPassengersPayload {
  passengers: Passenger[];
}

export interface AssignBookingPayload {
  assigneeId: string | null;
}

export interface BulkUpdateBookingsPayload {
  referenceCodes: string[];
  assigneeId?: string | null;
  priority?: string;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  method: string;
  transactionId: string | null;
  status: string;
  isRefund: boolean;
  createdAt: string;
}

export interface BookingActivity {
  id: string;
  action: string;
  createdAt: string;
}

export interface BookingNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface BookingAttachment {
  id: string;
  fileName?: string;
  documentType?: string;
}

export interface ManualBookingPayload {
  tourId: string;
  arrivalDate: string;
  departureDate?: string;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  adults: number;
  children?: number;
  infants?: number;
  userId?: string;
  availabilityId?: string;
  promoCode?: string;
  notes?: string;
  transportChoice?: string;
}

export interface AddNotePayload {
  content: string;
}

export interface AddAttachmentPayload {
  mediaAssetId: string;
}
