export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

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
  payments?: any[];
  activityLogs?: any[];
  notes?: any[];
  attachments?: any[];
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
  status?: BookingStatus;
  assigneeId?: string | null;
  priority?: string;
}

export interface AddPaymentPayload {
  amount: number;
  currency: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface AddNotePayload {
  content: string;
  isInternal: boolean;
}

export interface AddAttachmentPayload {
  file: File;
  documentType: string;
}
