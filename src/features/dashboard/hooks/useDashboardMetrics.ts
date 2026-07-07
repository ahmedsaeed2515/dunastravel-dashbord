import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { apiClient } from "@/lib/axios";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Parallelize fetching all metrics endpoints
      const [
        general,
        tours,
        commissions,
        wallets,
        crm,
        companies,
        communications
      ] = await Promise.all([
        dashboardApi.getMetrics().catch(() => null),
        apiClient.get('/admin/tours/stats').catch(() => null),
        apiClient.get('/admin/finance/commissions/metrics').catch(() => null),
        apiClient.get('/admin/finance/wallets/metrics').catch(() => null),
        apiClient.get('/admin/users/metrics').catch(() => null),
        apiClient.get('/admin/companies/metrics').catch(() => null),
        apiClient.get('/admin/communications/metrics').catch(() => null)
      ]);

      return {
        general,
        tours: tours?.data,
        commissions: commissions?.data,
        wallets: wallets?.data,
        crm: crm?.data,
        companies: companies?.data,
        communications: communications?.data
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
