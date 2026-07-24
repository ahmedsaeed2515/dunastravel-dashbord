import { Suspense } from "react";
import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Partner Commissions - Dunas Travel Admin",
};

export default function CommissionsPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Partner Commissions"
        description="Track, audit, approve, and disburse B2B travel agent commissions for completed tour bookings."
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
