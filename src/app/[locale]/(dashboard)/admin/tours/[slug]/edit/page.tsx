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

  const routeMapFromTour = tour.routeMapJsonb || (tour as any).routeMap;
  const routeMap = routeMapFromTour ? {
    title: localeText(routeMapFromTour.titleJsonb, 'ar') || 'Interactive Itinerary Journey Map',
    subtitle: localeText(routeMapFromTour.subtitleJsonb, 'ar') || 'Explore your day-by-day path across premier luxury landmarks',
    locations: Array.isArray(routeMapFromTour.locations)
      ? routeMapFromTour.locations.map((loc: any, index: number) => ({
          id: loc.id || `loc-${index + 1}`,
          dbKey: loc.dbKey || 'cairo',
          lat: typeof loc.lat === 'number' ? loc.lat : 0,
          lng: typeof loc.lng === 'number' ? loc.lng : 0,
          daysVisited: Array.isArray(loc.daysVisited) ? loc.daysVisited : [],
          name: localeText(loc.nameJsonb, 'ar') || loc.name || '',
          description: localeText(loc.descriptionJsonb, 'ar') || loc.description || '',
        }))
      : [],
  } : undefined;

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
    heroImage: (() => {
      const heroFromImages = Array.isArray(tour.images)
        ? tour.images.find((img: any) => img?.isHero)?.imageUrl
        : undefined;
      return heroFromImages || (typeof tour.heroImage === 'string' ? tour.heroImage : '') || (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') || (tour.images?.[0]?.imageUrl || '');
    })(),
    images: (() => {
      const rawImages = tour.images?.map((image) => image.imageUrl) || (tour.heroImage ? [tour.heroImage] : []);
      const heroFromImages = Array.isArray(tour.images)
        ? tour.images.find((img: any) => img?.isHero)?.imageUrl
        : undefined;
      const resolvedHero = heroFromImages || (typeof tour.heroImage === 'string' ? tour.heroImage : '') || (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') || rawImages[0] || '';
      let imgs = [...rawImages];
      if (resolvedHero && imgs.includes(resolvedHero)) {
        imgs = [resolvedHero, ...imgs.filter((img) => img !== resolvedHero)];
      } else if (resolvedHero && !imgs.includes(resolvedHero)) {
        imgs = [resolvedHero, ...imgs];
      }
      return imgs;
    })(),
    hotels: '',
    accommodation: tour.city ? [{ destination: tour.city, nights: 0, regime: '' }] : [],
    itinerary,
    routeMap,
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
          routeMap: routeMapFromTour ? {
            title: localeText(routeMapFromTour.titleJsonb, locale),
            subtitle: localeText(routeMapFromTour.subtitleJsonb, locale),
            locations: Array.isArray(routeMapFromTour.locations)
              ? routeMapFromTour.locations.map((loc: any) => ({
                  dbKey: loc.dbKey || 'cairo',
                  lat: loc.lat,
                  lng: loc.lng,
                  daysVisited: loc.daysVisited,
                  name: localeText(loc.nameJsonb, locale) || loc.name || '',
                  description: localeText(loc.descriptionJsonb, locale) || loc.description || '',
                }))
              : [],
          } : undefined,
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
