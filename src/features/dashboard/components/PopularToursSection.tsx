"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Flame, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { adminRoutes } from '@/config/admin-routes';
import { TourPerformanceItem } from '../types';

interface Props { tours?: TourPerformanceItem[]; isLoading?: boolean; isError?: boolean; }

/** Rankings are calculated and ordered by the dashboard service; this component never manufactures a tour or trend. */
export function PopularToursSection({ tours, isLoading, isError }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isAr = locale === 'ar';

  if (isLoading) return <Card className="p-6 text-sm">{isAr ? "جاري تحميل الرحلات الأكثر طلباً..." : "Loading ranked tours…"}</Card>;
  if (isError) return <Card className="p-6 text-destructive text-sm">{isAr ? "تعذر تحميل ترتيب الرحلات. يرجى إعادة المحاولة." : "Ranked tours could not be loaded. Retry the dashboard request."}</Card>;
  if (!tours || tours.length === 0) return <Card className="p-6 text-muted-foreground text-sm">{isAr ? "لا توجد رحلات مطابقة في هذه الفترة." : "No qualifying tours exist for the selected period."}</Card>;
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold flex gap-2 items-center text-foreground">
          <Flame className="text-amber-500 w-5 h-5" />
          {isAr ? "الرحلات الأكثر طلباً وحجزاً" : "Most Popular Tours"}
        </h2>
        <Link href={adminRoutes.tours} className="text-xs font-semibold text-primary hover:underline">
          {isAr ? "عرض كافة الرحلات ←" : "View all tours →"}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tours.slice(0, 4).map((tour) => {
          const title = tour.titleJsonb?.[locale] || tour.titleJsonb?.en || tour.slug;
          return (
            <Link key={tour.id} href={`${adminRoutes.tours}/${tour.slug}`} className="rounded-2xl border bg-card p-4 hover:border-amber-500/50 hover:shadow-md transition-all">
              {tour.heroImage ? (
                <img src={tour.heroImage} alt={title} className="h-28 w-full rounded-xl object-cover" />
              ) : (
                <div className="h-28 rounded-xl bg-muted/60 flex items-center justify-center text-xs text-muted-foreground" aria-label="No tour image">
                  {isAr ? "لا توجد صورة" : "No image"}
                </div>
              )}
              <h3 className="mt-3 font-bold text-sm line-clamp-2 text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {tour.country} · {tour.confirmedBookings} {isAr ? "حجز مؤكد" : "confirmed bookings"}
              </p>
              <p className="mt-2 text-sm font-extrabold font-mono text-foreground">
                ${tour.basePriceUsd?.toLocaleString()} 
                <span className="float-right inline-flex items-center gap-1 font-sans text-xs text-amber-500 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {tour.occupancyRate ?? 0}%
                </span>
              </p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
