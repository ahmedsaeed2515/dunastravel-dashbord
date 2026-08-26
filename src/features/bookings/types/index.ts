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

export interface Booking {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  totalAmount: string;
  currency: string;
  passengerCount: number;
  tourId: string;
  tourSlug: string;
  tourNameEn: string;
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt?: string;
  arrivalDate?: string | null;
  departureDate?: string | null;
  assigneeId?: string | null;
  priority?: string;
  tags?: string[];
  passengers?: Passenger[];
  billingInfo?: {
    fullName: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    createdAt: string;
  } | null;
  payments?: Payment[];
  activityLogs?: BookingActivity[];
  notes?: BookingNote[];
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
  fullName: string;
  email: string;
  phone: string;
  adults: number;
  children?: number;
  infants?: number;
  userId?: string;
  availabilityId?: string;
  promoCode?: string;
}

export interface AddNotePayload {
  content: string;
}

export interface AddAttachmentPayload {
  mediaAssetId: string;
}
