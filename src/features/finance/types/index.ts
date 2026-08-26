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
  attemptNumber?: number | null;
  transactionId: string | null;
  status: string;
  bookingStatus: string;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  failureMessage: string | null;
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
