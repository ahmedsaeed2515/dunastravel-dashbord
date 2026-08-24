"use client";

import { Globe2, Loader2, MapPinned, ShieldAlert } from "lucide-react";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import { useLandingPages } from "@/features/tours/hooks/useLandingPages";

/**
 * Destination administration is a filtered view of the durable
 * TourLandingPage domain. It intentionally owns no browser-local destination
 * array, package list, or tour mutations.
 */
export function DestinationsManager() {
  const { data, isLoading, error } = useLandingPages({ type: "DESTINATION", limit: 100 });
  const destinations = data?.data ?? [];
  const published = destinations.filter((destination) => destination.status === "PUBLISHED" && destination.isActive).length;
  const attachedTours = destinations.reduce((total, destination) => total + (destination.totalToursCount ?? 0), 0);

  return <div className="space-y-6 animate-in fade-in duration-300">
    <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/15 p-3 text-amber-500"><Globe2 className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-black text-foreground">Destination interfaces</h2>
            <p className="mt-1 text-sm text-muted-foreground">Published destination content, SEO, hero media, locale completion, and attached tours are persisted in landing pages.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-64">
          <Metric label="Published" value={published} />
          <Metric label="Attached tours" value={attachedTours} />
        </div>
      </div>
    </section>

    {isLoading ? <div className="flex min-h-40 items-center justify-center rounded-2xl border bg-card"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : error ? <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"><ShieldAlert className="h-5 w-5" /> Destination interfaces could not be loaded. Retry from the table controls.</div> : <LandingPagesTable fixedType="DESTINATION" />}
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5 flex items-center gap-1 font-mono text-lg font-bold text-foreground"><MapPinned className="h-3.5 w-3.5 text-amber-500" />{value}</div></div>;
}
