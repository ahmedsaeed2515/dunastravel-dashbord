"use client";

import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { PaymentsView } from "@/features/finance/components/PaymentsView";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function FinanceDashboardPage() {
  const tFinance = useTranslations("finance");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tFinance("title")}
        description={tFinance("commissionsDesc")}
      />

      <FinanceMetricsBanner />
      <PaymentsView />
      <CommissionsView />
    </div>
  );
}
