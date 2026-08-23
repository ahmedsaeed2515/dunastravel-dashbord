import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { apiClient } from "@/lib/axios";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const [
        general,
        tours,
        commissions,
        wallets,
        crm,
        companies,
        communications,
        currencies
      ] = await Promise.all([
        dashboardApi.getSummary(),
        apiClient.get('/admin/tours/stats'),
        apiClient.get('/admin/finance/commissions/metrics'),
        apiClient.get('/admin/finance/wallets/metrics'),
        apiClient.get('/admin/users/crm/metrics'),
        apiClient.get('/admin/companies/metrics'),
        apiClient.get('/admin/communications/logs/metrics'),
        apiClient.get('/admin/currency/rates')
      ]);

      return {
        general: (general as any)?.data ?? general,
        tours: (tours as any)?.data ?? tours,
        commissions: (commissions as any)?.data ?? commissions,
        wallets: (wallets as any)?.data ?? wallets,
        crm: (crm as any)?.data ?? crm,
        companies: (companies as any)?.data ?? companies,
        communications: (communications as any)?.data ?? communications,
        currencies: (currencies as any)?.data ?? currencies
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
