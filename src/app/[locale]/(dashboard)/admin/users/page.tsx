import { Suspense } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable/CustomersTable";
import { CustomerMetricsBanner } from "@/features/customers/components/CustomerMetricsBanner";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Customer CRM Management - Dunas Travel Admin",
};

export default function CustomersCrmPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Customer CRM Management"
        description="Central traveler directory for Dunas Travel. Track customer relationships, booking history, lifetime spend, VIP tags, and passenger documentation."
        actions={
          <RequirePermission action="manage" resource="users">
            <Button size="sm" variant="gold" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Register Customer</span>
            </Button>
          </RequirePermission>
        }
      />

      {/* Live CRM Statistics Banner */}
      <CustomerMetricsBanner />

      {/* Primary Customer Table & Drawers Layer */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <CustomersTable />
        </Suspense>
      </div>
    </div>
  );
}
