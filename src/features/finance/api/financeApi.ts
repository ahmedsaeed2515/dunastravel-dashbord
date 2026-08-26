import { apiClient } from "@/lib/axios";
import { 
  Wallet, 
  WalletTransaction, 
  Commission, 
  WalletMetrics, 
  CommissionMetrics, 
  CommissionQueryFilters, 
  PaginatedResponse,
  PaymentRecord,
  PaymentQueryFilters,
  ReconciliationSummary
} from "../types";

export const financeApi = {
  getPayments: async (filters: PaymentQueryFilters): Promise<PaginatedResponse<PaymentRecord>> => {
    return apiClient.get<PaginatedResponse<PaymentRecord>, PaginatedResponse<PaymentRecord>>('/admin/finance/payments', { params: filters });
  },

  getReconciliationSummary: async (): Promise<ReconciliationSummary> => {
    return apiClient.get<ReconciliationSummary, ReconciliationSummary>('/admin/finance/reconciliation');
  },

  // Wallets
  getWalletMetrics: async (): Promise<WalletMetrics> => {
    return apiClient.get<WalletMetrics, WalletMetrics>('/admin/finance/wallets/metrics');
  },

  getWallet: async (ownerType: 'USER' | 'COMPANY', ownerId: string): Promise<Wallet> => {
    return apiClient.get<Wallet, Wallet>(`/admin/finance/wallets/${ownerType}/${ownerId}`);
  },

  getWalletTransactions: async (walletId: string, referenceType?: string): Promise<WalletTransaction[]> => {
    const params = referenceType ? { referenceType } : {};
    return apiClient.get<WalletTransaction[], WalletTransaction[]>(`/admin/finance/wallets/${walletId}/transactions`, { params });
  },

  addManualTransaction: async (payload: { ownerType: string; ownerId: string; amount: number; type: string; description?: string }): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction, WalletTransaction>("/admin/finance/wallets/transactions/manual", payload);
  },

  // Commissions
  getCommissionMetrics: async (): Promise<CommissionMetrics> => {
    return apiClient.get<CommissionMetrics, CommissionMetrics>('/admin/finance/commissions/metrics');
  },

  getCommissions: async (filters: CommissionQueryFilters): Promise<PaginatedResponse<Commission>> => {
    return apiClient.get<PaginatedResponse<Commission>, PaginatedResponse<Commission>>("/admin/finance/commissions", { params: filters });
  },

  updateCommissionStatus: async (id: string, status: string): Promise<Commission> => {
    return apiClient.patch<Commission, Commission>(`/admin/finance/commissions/${id}/status`, { status });
  },

  // Refunds
  refundPayment: async (payload: { idempotencyKey: string; paymentId: string; amount?: number; reason: string }): Promise<{ success: boolean; refundId: string; status: string }> => {
    return apiClient.post<{ success: boolean; refundId: string; status: string }, { success: boolean; refundId: string; status: string }>("/admin/finance/refunds", payload);
  }
};
