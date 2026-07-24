"use client";

import { Suspense } from "react";
import { UsersTable } from "@/features/users/components/UsersTable/UsersTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function RolesPage() {
  const tRoles = useTranslations("roles");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tRoles("title")}
        description={tRoles("description")}
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
}
