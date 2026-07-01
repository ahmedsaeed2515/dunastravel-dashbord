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
    const { data } = await apiClient.get("/admin/finance/wallets/metrics");
    return data;
  },

  getWallet: async (ownerType: 'USER' | 'COMPANY', ownerId: string): Promise<Wallet> => {
    const { data } = await apiClient.get(`/admin/finance/wallets/${ownerType}/${ownerId}`);
    return data;
  },

  getWalletTransactions: async (walletId: string, referenceType?: string): Promise<WalletTransaction[]> => {
    const params = referenceType ? { referenceType } : {};
    const { data } = await apiClient.get(`/admin/finance/wallets/${walletId}/transactions`, { params });
    return data;
  },

  addManualTransaction: async (payload: { ownerType: string; ownerId: string; amount: number; type: string; description?: string }): Promise<WalletTransaction> => {
    const { data } = await apiClient.post("/admin/finance/wallets/transactions/manual", payload);
    return data;
  },

  // Commissions
  getCommissionMetrics: async (): Promise<CommissionMetrics> => {
    const { data } = await apiClient.get("/admin/finance/commissions/metrics");
    return data;
  },

  getCommissions: async (filters: CommissionQueryFilters): Promise<PaginatedResponse<Commission>> => {
    const { data } = await apiClient.get("/admin/finance/commissions", { params: filters });
    return data;
  },

  updateCommissionStatus: async (id: string, status: string): Promise<Commission> => {
    const { data } = await apiClient.patch(`/admin/finance/commissions/${id}/status`, { status });
    return data;
  }
};
