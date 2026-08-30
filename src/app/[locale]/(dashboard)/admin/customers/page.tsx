"use client";

import { useState, Suspense } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable/CustomersTable";
import { CustomerMetricsBanner } from "@/features/customers/components/CustomerMetricsBanner";
import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function CustomersCrmPage() {
  const tCustomers = useTranslations("customers");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tCustomers("title")}
        description={tCustomers("description")}
        actions={
          <RequirePermission action="manage" resource="users">
            <Button onClick={() => setIsCreateOpen(true)} size="sm" variant="gold" className="gap-1.5 font-bold">
              <PlusCircle className="h-4 w-4" />
              <span>{tCustomers("addCustomer")}</span>
            </Button>
          </RequirePermission>
        }
      />

      {/* Live CRM Statistics Banner */}
      <CustomerMetricsBanner key={`metrics-${refreshKey}`} />

      {/* Primary Customer Table & Drawers Layer */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <CustomersTable key={`table-${refreshKey}`} />
        </Suspense>
      </div>

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
