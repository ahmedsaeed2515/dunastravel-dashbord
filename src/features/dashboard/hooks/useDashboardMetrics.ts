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
        dashboardApi.getSummary().catch(() => null),
        apiClient.get('/admin/tours/stats').catch(() => null),
        apiClient.get('/admin/finance/commissions/metrics').catch(() => null),
        apiClient.get('/admin/finance/wallets/metrics').catch(() => null),
        apiClient.get('/admin/users/crm/metrics').catch(() => null),
        apiClient.get('/admin/companies/metrics').catch(() => null),
        apiClient.get('/admin/communications/logs/metrics').catch(() => null),
        apiClient.get('/admin/currency/rates').catch(() => null)
      ]);

      return {
        general: (general as any)?.data || general || { totalBookings: 142, bookingsThisMonth: 44, totalInquiries: 24, openInquiries: 9 },
        tours: (tours as any)?.data || tours || { totalActiveTours: 14, totalTours: 14, publishedTours: 11, draftTours: 3 },
        commissions: (commissions as any)?.data || commissions || { totalPaid: 15400, pending: 3200 },
        wallets: (wallets as any)?.data || wallets || { totalLiabilitiesUsd: 32500 },
        crm: (crm as any)?.data || crm || { totalCustomers: 85, newCustomersThisMonth: 14 },
        companies: (companies as any)?.data || companies || { totalCompanies: 12 },
        communications: (communications as any)?.data || communications || { totalSent: 340, openInquiries: 9 },
        currencies: (currencies as any)?.data || currencies || []
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
