"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import type { Tour } from "@/features/tours/types";

/**
 * Compatibility helper for destination-oriented consumers. Catalog data itself
 * is always obtained from the backend through ToursTable.
 */
export function resolveTourDestination(tour: Pick<Tour, "country">): string {
  return tour.country?.trim() || "Unassigned";
}

export default function ToursPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Tour Catalog"
        description="Manage persisted tours, publication lifecycle, availability, and destination relationships."
      />
      <ToursTable />
      <section className="space-y-3 border-t pt-6">
        <div>
          <h2 className="text-lg font-semibold">Destination interfaces</h2>
          <p className="text-sm text-muted-foreground">
            Destination content and tour ordering use the persisted backend aggregate.
          </p>
        </div>
        <LandingPagesTable fixedType="DESTINATION" />
      </section>
    </div>
  );
}
