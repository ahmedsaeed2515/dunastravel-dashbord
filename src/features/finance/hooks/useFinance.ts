import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "../api/financeApi";
import { CommissionQueryFilters, CommissionStatus, PaymentQueryFilters } from "../types";
import { toast } from "sonner";

export const financeKeys = {
  all: ["finance"] as const,
  walletMetrics: () => [...financeKeys.all, "walletMetrics"] as const,
  wallets: (ownerType: string, ownerId: string) => [...financeKeys.all, "wallets", ownerType, ownerId] as const,
  walletTransactions: (walletId: string) => [...financeKeys.all, "transactions", walletId] as const,
  commissionMetrics: () => [...financeKeys.all, "commissionMetrics"] as const,
  commissions: (filters: CommissionQueryFilters) => [...financeKeys.all, "commissions", filters] as const,
  payments: (filters: PaymentQueryFilters) => [...financeKeys.all, "payments", filters] as const,
  reconciliation: () => [...financeKeys.all, "reconciliation"] as const,
};

export function useWalletMetrics() {
  return useQuery({
    queryKey: financeKeys.walletMetrics(),
    queryFn: () => financeApi.getWalletMetrics(),
  });
}

export function useWallet(ownerType: 'USER' | 'COMPANY', ownerId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeKeys.wallets(ownerType, ownerId),
    queryFn: () => financeApi.getWallet(ownerType, ownerId),
    enabled: options?.enabled,
  });
}

export function useWalletTransactions(walletId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeKeys.walletTransactions(walletId),
    queryFn: () => financeApi.getWalletTransactions(walletId),
    enabled: options?.enabled && !!walletId,
  });
}

export function useAddManualTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.addManualTransaction,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.walletMetrics() });
      queryClient.invalidateQueries({ queryKey: financeKeys.wallets(variables.ownerType, variables.ownerId) });
      if (data.walletId) {
        queryClient.invalidateQueries({ queryKey: financeKeys.walletTransactions(data.walletId) });
      }
      toast.success("Transaction added to wallet successfully.");
    },
    onError: () => toast.error("Failed to add transaction."),
  });
}

export function useCommissionMetrics() {
  return useQuery({
    queryKey: financeKeys.commissionMetrics(),
    queryFn: () => financeApi.getCommissionMetrics(),
  });
}

export function usePayments(filters: PaymentQueryFilters) {
  return useQuery({
    queryKey: financeKeys.payments(filters),
    queryFn: () => financeApi.getPayments(filters),
    placeholderData: (prev) => prev,
  });
}

export function useReconciliationSummary() {
  return useQuery({
    queryKey: financeKeys.reconciliation(),
    queryFn: () => financeApi.getReconciliationSummary(),
  });
}

export function useCommissions(filters: CommissionQueryFilters) {
  return useQuery({
    queryKey: financeKeys.commissions(filters),
    queryFn: () => financeApi.getCommissions(filters),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateCommissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CommissionStatus }) => financeApi.updateCommissionStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.commissionMetrics() });
      queryClient.invalidateQueries({ queryKey: financeKeys.walletMetrics() });
      // Invalidate commissions lists blindly since filters vary
      queryClient.invalidateQueries({ queryKey: ["finance", "commissions"] });
      // Also invalidate company list / detail if applicable
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      
      if (data.status === 'APPROVED') {
        toast.success("Commission approved! Funds have been credited to the partner's wallet.");
      } else {
        toast.success(`Commission marked as ${data.status}.`);
      }
    },
    onError: () => toast.error("Failed to update commission status."),
  });
}
