import { Suspense } from "react";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";

export const metadata = {
  title: "Tours & Travel Products - Dunas Travel",
};

export default function ToursPage() {
  return (
    <div className="p-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold font-serif text-foreground">Tours & Travel Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage enterprise travel products, itineraries, surge pricing rules, and publishing channels.
          </p>
        </div>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border p-6">
        <Suspense fallback={<TableSkeleton />}>
          <ToursTable />
        </Suspense>
      </div>
    </div>
  );
}
