import { Suspense } from "react";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Tours & Travel Products - Dunas Travel Admin",
};

export default function ToursPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Tours & Travel Products"
        description="Manage enterprise tour products, itineraries, 5-language localized content, pricing structures, and availability capacity."
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <ToursTable />
        </Suspense>
      </div>
    </div>
  );
}
