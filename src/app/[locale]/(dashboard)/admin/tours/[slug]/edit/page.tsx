"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTour } from "@/features/tours/hooks/useTours";
import { Tour } from "@/features/tours/types";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import type { TripModel } from "@/types/dunas-suite";
import { destinationForCountry } from "@/lib/tour-destinations";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export const TOUR_EDITOR_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية (Arabic)", dir: "rtl" },
  { code: "es", name: "Español (Spanish)", dir: "ltr" },
  { code: "pt", name: "Português (Portuguese)", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
];

const LOCALES = ["ar", "en", "es", "pt", "it"] as const;

function localeText(value: Record<string, unknown> | null | undefined, locale: string): string {
  return typeof value?.[locale] === "string" ? (value[locale] as string) : "";
}

function localeList(value: Record<string, unknown> | null | undefined, locale: string): string[] {
  return Array.isArray(value?.[locale]) ? value[locale].filter((item): item is string => typeof item === "string") : [];
}

function tourToTripModel(tour: Tour): TripModel {
  const highlights = tour.highlightsJsonb || tour.highlightJsonb;
  const itinerary = (tour.itineraries || []).map((item, index) => ({
    day: index + 1,
    title: item.dayLabel || '',
    description: localeText(item.descriptionJsonb, 'ar'),
    meals: localeText(item.mealsJsonb, 'ar'),
  }));

  return {
    id: tour.id,
    slug: tour.slug,
    title: localeText(tour.titleJsonb, 'ar') || localeText(tour.titleJsonb, 'en') || tour.slug,
    subtitle: localeText(tour.subtitleJsonb, 'ar'),
    destination: destinationForCountry(tour.country),
    market: tour.market || '',
    language: 'ar',
    type: tour.category || '',
    duration: localeText(tour.durationJsonb, 'ar'),
    departures: localeText(tour.departureInfoJsonb, 'ar'),
    price:
      tour.basePriceUsd !== undefined && tour.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
        ? Number(tour.basePriceUsd)
        : 0,
    hotelCategory: '',
    rating: Number(tour.sourceRating || 0),
    reviewCount: tour.sourceReviewCount || 0,
    popular: !!tour.isFeatured,
    familyFriendly: false,
    honeymoon: false,
    luxury: false,
    cultural: false,
    adventure: false,
    overview: localeText(tour.overviewJsonb, 'ar'),
    highlights: localeList(highlights, 'ar'),
    included: localeList(tour.includedServicesJsonb || tour.inclusionJsonb, 'ar'),
    excluded: localeList(tour.excludedServicesJsonb || tour.exclusionJsonb, 'ar'),
    images: tour.images?.map((image) => image.imageUrl) || (tour.heroImage ? [tour.heroImage] : []),
    hotels: '',
    accommodation: tour.city ? [{ destination: tour.city, nights: 0, regime: '' }] : [],
    itinerary,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        {
          title: localeText(tour.titleJsonb, locale),
          subtitle: localeText(tour.subtitleJsonb, locale),
          overview: localeText(tour.overviewJsonb, locale),
          duration: localeText(tour.durationJsonb, locale),
          highlights: localeList(highlights, locale),
          included: localeList(tour.includedServicesJsonb || tour.inclusionJsonb, locale),
          excluded: localeList(tour.excludedServicesJsonb || tour.exclusionJsonb, locale),
          itinerary: (tour.itineraries || []).map((item, index) => ({
            day: index + 1,
            title: item.dayLabel || '',
            description: localeText(item.descriptionJsonb, locale),
            meals: localeText(item.mealsJsonb, locale),
          })),
        },
      ])
    ) as TripModel['translations'],
  };
}

export default function EditTourPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const router = useRouter();
  const { data: tour, isLoading, error } = useTour(slug);

  const tripModel = useMemo(() => {
    if (!tour) return null;
    return tourToTripModel(tour);
  }, [tour]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm text-muted-foreground font-semibold">جاري فتح محرر الرحلة الفاخر والترجمات الـ 5...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-destructive">لم يتم العثور على الرحلة</h2>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> العودة لقائمة الرحلات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/${locale}/admin/tours`)}
          className="rounded-xl text-xs gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> العودة للرحلات
        </Button>
      </div>

      <TripEditorModal
        trip={tripModel}
        isOpen={true}
        onClose={() => router.push(`/${locale}/admin/tours`)}
      />
    </div>
  );
}
