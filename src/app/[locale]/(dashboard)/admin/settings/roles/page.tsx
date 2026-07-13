import { Suspense } from "react";
import { UsersTable } from "@/features/users/components/UsersTable/UsersTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";

export const metadata = {
  title: "Users & Roles Management - Dunas Travel",
};

export default function RolesPage() {
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              System Configuration
            </span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-base">
            Manage system administrators, agents, and access control policies across the Dunas Travel operating system.
          </p>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
}
