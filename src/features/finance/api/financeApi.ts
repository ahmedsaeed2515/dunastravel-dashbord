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
import { requireArray, requireObject, requirePaginated } from "@/lib/api-response";

export const financeApi = {
  // Wallets
  getWalletMetrics: async (): Promise<WalletMetrics> => {
    const res: any = await apiClient.get("/admin/finance/wallets/metrics");
    return requireObject(res, "wallet metrics");
  },

  getWallet: async (ownerType: 'USER' | 'COMPANY', ownerId: string): Promise<Wallet> => {
    const response = await apiClient.get(`/admin/finance/wallets/${ownerType}/${ownerId}`);
    return requireObject(response, "wallet");
  },

  getWalletTransactions: async (walletId: string, referenceType?: string): Promise<WalletTransaction[]> => {
    const params = referenceType ? { referenceType } : {};
    const response = await apiClient.get(`/admin/finance/wallets/${walletId}/transactions`, { params });
    return requireArray(response, "wallet transactions");
  },

  addManualTransaction: async (payload: { ownerType: string; ownerId: string; amount: number; type: string; description?: string }): Promise<WalletTransaction> => {
    const response = await apiClient.post("/admin/finance/wallets/transactions/manual", payload);
    return requireObject(response, "manual wallet transaction");
  },

  reconcileLedger: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.post("/admin/wallets/reconcile-ledger");
    return requireObject(response, "wallet reconciliation");
  },

  // Commissions
  getCommissionMetrics: async (): Promise<CommissionMetrics> => {
    const res: any = await apiClient.get("/admin/finance/commissions/metrics");
    return requireObject(res, "commission metrics");
  },

  getCommissions: async (filters: CommissionQueryFilters): Promise<PaginatedResponse<Commission>> => {
    const response = await apiClient.get("/admin/finance/commissions", { params: filters });
    return requirePaginated(response, "commissions");
  },

  updateCommissionStatus: async (id: string, status: string): Promise<Commission> => {
    const response = await apiClient.patch(`/admin/finance/commissions/${id}/status`, { status });
    return requireObject(response, "updated commission");
  },

  // Refunds
  refundPayment: async (payload: { idempotencyKey: string; paymentId: string; amount: number; currency: string; reason?: string }): Promise<any> => {
    const response = await apiClient.post("/admin/finance/refunds", payload);
    return response as any;
  }
};
