import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";
import { toursApi } from "@/features/tours/api/toursApi";
import { financeApi } from "@/features/finance/api/financeApi";
import { customersApi } from "@/features/customers/api/customersApi";
import { companiesApi } from "@/features/companies/api/companiesApi";
import { communicationsApi } from "@/features/communications/api/communicationsApi";
import { currencyApi } from "@/features/currency/api/currencyApi";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const [general, tours, commissions, wallets, crm, companies, communications, currencies] = await Promise.all([
        dashboardApi.getSummary(),
        toursApi.getTourStats(),
        financeApi.getCommissionMetrics(),
        financeApi.getWalletMetrics(),
        customersApi.getMetrics(),
        companiesApi.getMetrics(),
        communicationsApi.getMetrics(),
        currencyApi.getRates(),
      ]);

      return { general, tours, commissions, wallets, crm, companies, communications, currencies };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
