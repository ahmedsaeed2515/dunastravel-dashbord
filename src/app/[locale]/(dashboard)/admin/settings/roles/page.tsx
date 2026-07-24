import { Suspense } from "react";
import { UsersTable } from "@/features/users/components/UsersTable/UsersTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Users & Roles Management - Dunas Travel Admin",
};

export default function RolesPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Users & Access Roles"
        description="System administration directory, user accounts, role assignments (ADMIN, AGENT, CUSTOMER), and security permissions."
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
}
