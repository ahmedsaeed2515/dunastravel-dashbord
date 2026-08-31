export type WalletOwnerType = 'USER' | 'COMPANY';
export type WalletTransactionType = 'CREDIT' | 'DEBIT';
export type WalletTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface Wallet {
  id: string;
  ownerType: WalletOwnerType;
  ownerId: string;
  currency: string;
  balance: string; // Decimal from Prisma
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: string;
  type: WalletTransactionType;
  referenceType: string;
  referenceId: string | null;
  description: string | null;
  status: WalletTransactionStatus;
  createdAt: string;
}

export interface Commission {
  id: string;
  companyId: string;
  bookingId: string;
  rate: string;
  amount: string;
  currency: string;
  status: CommissionStatus;
  createdAt: string;
  company?: { name: string; referenceCode: string };
  booking?: { referenceCode: string; totalAmountUsd: string; invoiceNumber?: string };
}

export interface WalletMetrics {
  totalCompanyWallets: number;
  totalLiabilitiesUsd: number;
}

export interface CommissionMetrics {
  totalPendingUsd: number;
  totalApprovedUsd: number;
  pendingCount: number;
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

export interface CommissionQueryFilters {
  page?: number;
  limit?: number;
  companyId?: string;
  bookingId?: string;
  bookingReference?: string;
  status?: CommissionStatus;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingReferenceCode: string;
  amount: string;
  currency: string;
  provider: string;
  providerEnvironment?: string | null;
  merchantReference: string | null;
  providerPaymentId: string | null;
  providerStatus?: string | null;
  providerAuthCode?: string | null;
  lastProviderCheckAt?: string | null;
  checkoutExpiresAt?: string | null;
  attemptNumber?: number | null;
  transactionId: string | null;
  status: string;
  bookingStatus: string;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  failureMessage: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  invoiceNumber?: string | null;
  refundedAmount?: string;
}

export interface PaymentQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ReconciliationSummary {
  statusCounts: Record<string, number>;
  stalePendingCount: number;
  pendingRefundCount: number;
  missingReferenceCount: number;
  generatedAt: string;
}

export interface WalletDirectoryItem {
  id: string;
  ownerType: WalletOwnerType;
  ownerId: string;
  currency: string;
  balance: number;
  status: string;
  transactionsCount: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    referenceCode?: string;
    type?: string;
    role?: string;
    status?: string;
    commissionRate?: number;
    company?: { id: string; name: string; referenceCode: string };
  } | null;
}

export interface WalletListQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  ownerType?: WalletOwnerType;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
