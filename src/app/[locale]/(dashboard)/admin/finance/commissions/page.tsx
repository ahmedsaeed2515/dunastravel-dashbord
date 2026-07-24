"use client";

import { Suspense } from "react";
import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function CommissionsPage() {
  const tFinance = useTranslations("finance");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tFinance("commissionsTitle")}
        description={tFinance("commissionsDesc")}
      />

      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        <Suspense fallback={<TableSkeleton />}>
          <CommissionsView />
        </Suspense>
      </RequirePermission>
    </div>
  );
}
