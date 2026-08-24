"use client";

import Link from 'next/link';
import { Flame, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { adminRoutes } from '@/config/admin-routes';
import { TourPerformanceItem } from '../types';

interface Props { tours?: TourPerformanceItem[]; isLoading?: boolean; isError?: boolean; }

/** Rankings are calculated and ordered by the dashboard service; this component never manufactures a tour or trend. */
export function PopularToursSection({ tours, isLoading, isError }: Props) {
  if (isLoading) return <Card className="p-6">Loading ranked tours…</Card>;
  if (isError) return <Card className="p-6 text-destructive">Ranked tours could not be loaded. Retry the dashboard request.</Card>;
  if (!tours || tours.length === 0) return <Card className="p-6 text-muted-foreground">No qualifying tours exist for the selected period.</Card>;
  return <Card className="p-6 space-y-4">
    <div className="flex items-center justify-between"><h2 className="font-bold flex gap-2 items-center"><Flame className="text-amber-500" />Most Popular Tours</h2><Link href={adminRoutes.tours}>View all tours</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tours.slice(0, 4).map((tour) => <Link key={tour.id} href={`${adminRoutes.tours}/${tour.slug}`} className="rounded-xl border p-4 hover:border-amber-500/50">
        {tour.heroImage ? <img src={tour.heroImage} alt={tour.titleJsonb.en ?? tour.slug} className="h-28 w-full rounded-lg object-cover" /> : <div className="h-28 rounded-lg bg-muted" aria-label="No tour image" />}
        <h3 className="mt-3 font-semibold line-clamp-2">{tour.titleJsonb.en ?? tour.slug}</h3>
        <p className="text-xs text-muted-foreground">{tour.country} · {tour.confirmedBookings} confirmed bookings</p>
        <p className="mt-2 text-sm font-bold">${tour.basePriceUsd.toLocaleString()} <span className="float-right inline-flex gap-1"><Star className="h-4 w-4 text-amber-500" />{tour.occupancyRate}%</span></p>
      </Link>)}
    </div>
  </Card>;
}
