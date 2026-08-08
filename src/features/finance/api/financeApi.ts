import { apiClient } from "@/lib/axios";
import { 
  Wallet, 
  WalletTransaction, 
  Commission, 
  WalletMetrics, 
  CommissionMetrics, 
  CommissionQueryFilters, 
  PaginatedResponse 
} from "../types";

export const financeApi = {
  // Wallets
  getWalletMetrics: async (): Promise<WalletMetrics> => {
    const res: any = await apiClient.get("/admin/finance/wallets/metrics");
    return res?.totalLiabilitiesUsd !== undefined ? res : res?.data || res;
  },

  getWallet: async (ownerType: 'USER' | 'COMPANY', ownerId: string): Promise<Wallet> => {
    const response = await apiClient.get(`/admin/finance/wallets/${ownerType}/${ownerId}`);
    return response as any;
  },

  getWalletTransactions: async (walletId: string, referenceType?: string): Promise<WalletTransaction[]> => {
    const params = referenceType ? { referenceType } : {};
    const response = await apiClient.get(`/admin/finance/wallets/${walletId}/transactions`, { params });
    return response as any;
  },

  addManualTransaction: async (payload: { ownerType: string; ownerId: string; amount: number; type: string; description?: string }): Promise<WalletTransaction> => {
    const response = await apiClient.post("/admin/finance/wallets/transactions/manual", payload);
    return response as any;
  },

  // Commissions
  getCommissionMetrics: async (): Promise<CommissionMetrics> => {
    const res: any = await apiClient.get("/admin/finance/commissions/metrics");
    return res?.totalPendingUsd !== undefined ? res : res?.data || res;
  },

  getCommissions: async (filters: CommissionQueryFilters): Promise<PaginatedResponse<Commission>> => {
    const response = await apiClient.get("/admin/finance/commissions", { params: filters });
    return response as any;
  },

  updateCommissionStatus: async (id: string, status: string): Promise<Commission> => {
    const response = await apiClient.patch(`/admin/finance/commissions/${id}/status`, { status });
    return response as any;
  },

  // Refunds
  refundPayment: async (payload: { idempotencyKey: string; paymentId: string; amount: number; currency: string; reason?: string }): Promise<any> => {
    const response = await apiClient.post("/admin/finance/refunds", payload);
    return response as any;
  }
};
