import { Suspense } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable/CustomersTable";
import { CustomerMetricsBanner } from "@/features/customers/components/CustomerMetricsBanner";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";

export const metadata = {
  title: "Customer CRM Management - Dunas Travel",
};

export default function CustomersCrmPage() {
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Executive Luxury Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Phase 5 Core Engine
            </span>
            <span className="text-xs text-muted-foreground font-mono">Dunas Travel Operating System</span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Customer CRM Management</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-base">
            The central operational memory of Dunas Travel. Track every customer interaction, booking history, payment ledger, passport scans, and internal notes.
          </p>
        </div>
        
        <RequirePermission action="manage" resource="users">
          <Button className="shadow-sm h-10 px-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Register Customer</span>
          </Button>
        </RequirePermission>
      </div>

      {/* Live CRM Statistics Banner */}
      <CustomerMetricsBanner />

      {/* Primary Customer Table & Drawers Layer */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <Suspense fallback={<TableSkeleton />}>
          <CustomersTable />
        </Suspense>
      </div>
    </div>
  );
}
