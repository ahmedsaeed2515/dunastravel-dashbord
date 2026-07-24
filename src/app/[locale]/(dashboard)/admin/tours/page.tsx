"use client";

import { Suspense } from "react";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";

export default function ToursPage() {
  const tTours = useTranslations("tours");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tTours("title")}
        description={tTours("description")}
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <ToursTable />
        </Suspense>
      </div>
    </div>
  );
}
