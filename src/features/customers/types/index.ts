import { Booking } from '@/features/bookings/types';

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone?: string | null;
  isVip: boolean;
  status: string; // 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  tags: string[];
  segments: string[];
  nationality?: string | null;
  bookingsCount: number;
  notesCount: number;
  documentsCount: number;
  totalSpent: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  noteType: string; // 'INTERNAL' | 'SALES' | 'OPERATIONS'
  isPinned: boolean;
  createdAt: string;
  authorName: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  mediaAssetId: string;
  documentType: string; // 'PASSPORT' | 'VISA' | 'NATIONAL_ID' | 'INSURANCE' | 'TICKET' | 'INVOICE' | 'OTHER'
  title: string;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface CustomerActivityLog {
  id: string;
  action: string;
  details?: any;
  createdAt: string;
  authorName: string;
}

export interface CustomerDetail {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  isVip: boolean;
  status: string;
  tags: string[];
  segments: string[];
  passportNumber?: string | null;
  nationality?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: { name?: string; relationship?: string; phone?: string } | null;
  address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string } | null;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  preferredDestination?: string | null;
  preferredTravelType?: string | null;
  familyMembers?: any[] | null;
  travelCompanions?: any[] | null;
  marketingConsent: boolean;
  phoneVerified: boolean;
  customerSource?: string | null;
  referralSource?: string | null;
  futureCompanyId?: string | null;
  futureWalletId?: string | null;
  futureCommissionPlan?: string | null;
  createdAt: string;
  updatedAt: string;

  totalSpent: number;
  totalPaid: number;
  outstandingBalance: number;
  averageSpend: number;
  favoriteTour: string;

  bookings: Booking[];
  notes: CustomerNote[];
  documents: CustomerDocument[];
  timeline: CustomerActivityLog[];
}

export interface CustomerCrmMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  vipCustomers: number;
  customersWithActiveBookings: number;
  customersWithOutstandingPayments: number;
  topSpendingCustomers: {
    id: string;
    name: string;
    email: string;
    isVip: boolean;
    customerNumber: string;
    totalSpent: number;
  }[];
  averageBookingValue: number;
  lifetimeValue: number;
  customerSatisfaction: number;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isVip?: string;
  tag?: string;
  segment?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface UpdateCustomerCrmPayload {
  customerNumber?: string;
  isVip?: boolean;
  tags?: string[];
  segments?: string[];
  status?: string;
  passportNumber?: string;
  nationality?: string;
  gender?: string;
  dateOfBirth?: string;
  emergencyContact?: Record<string, any>;
  address?: Record<string, any>;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredDestination?: string;
  preferredTravelType?: string;
  familyMembers?: any[];
  travelCompanions?: any[];
  marketingConsent?: boolean;
  phoneVerified?: boolean;
  customerSource?: string;
  referralSource?: string;
  futureCompanyId?: string;
  futureWalletId?: string;
  futureCommissionPlan?: string;
}

export interface BulkUpdateCustomersPayload {
  userIds: string[];
  tags?: string[];
  segments?: string[];
  isVip?: boolean;
  status?: string;
}

export interface AddCustomerNotePayload {
  content: string;
  noteType?: string;
  isPinned?: boolean;
}

export interface AddCustomerDocumentPayload {
  mediaAssetId: string;
  documentType?: string;
  title: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  isVip?: boolean;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredDestination?: string;
  preferredTravelType?: string;
  customerSource?: string;
  initialNote?: string;
  tags?: string[];
  segments?: string[];
  passportNumber?: string;
}

