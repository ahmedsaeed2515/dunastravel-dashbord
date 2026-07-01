"use client";

import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { CommissionsView } from "@/features/finance/components/CommissionsView";

export default function FinanceDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight text-primary">Finance & Partner Commissions</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage B2B digital wallets, agency commissions, and platform payouts.
          </p>
        </div>
      </div>

      <FinanceMetricsBanner />
      <CommissionsView />
    </div>
  );
}
