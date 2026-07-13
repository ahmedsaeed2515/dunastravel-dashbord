import { Suspense } from "react";
import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";

export const metadata = {
  title: "Partner Commissions - Dunas Travel",
};

export default function CommissionsPage() {
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Financial Operations
            </span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Partner Commissions</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-base">
            Track, manage, and approve B2B partner commissions for generated bookings across the platform.
          </p>
        </div>
      </div>

      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        <Suspense fallback={<TableSkeleton />}>
          <CommissionsView />
        </Suspense>
      </RequirePermission>
    </div>
  );
}
