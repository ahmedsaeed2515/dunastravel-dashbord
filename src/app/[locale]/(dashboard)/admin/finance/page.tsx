"use client";

import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { PageHeader } from "@/components/shared/PageHeader";

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Finance Overview"
        description="Comprehensive financial metrics for Dunas Travel platform, B2B partner commissions, wallet liabilities, and payment balances."
      />

      <FinanceMetricsBanner />
      <CommissionsView />
    </div>
  );
}
