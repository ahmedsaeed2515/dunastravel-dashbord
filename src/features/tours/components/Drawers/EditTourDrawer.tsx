"use client";

import { useMemo } from "react";
import { Tour } from "../../types";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import type { TripModel } from "@/types/dunas-suite";
import { destinationForCountry, resolveTourDestination } from "@/lib/tour-destinations";

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

  const resolvedDest = resolveTourDestination(tour);
  const destSlug = (resolvedDest ? resolvedDest.toLowerCase() : destinationForCountry(tour.country)) || 'egypt';

  return {
    id: tour.id,
    slug: tour.slug,
    title: localeText(tour.titleJsonb, 'ar') || localeText(tour.titleJsonb, 'en') || tour.slug,
    subtitle: localeText(tour.subtitleJsonb, 'ar'),
    destination: destSlug,
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

interface EditTourDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTourDrawer({ tour, open, onOpenChange }: EditTourDrawerProps) {
  const tripModel = useMemo(() => {
    if (!tour) return null;
    return tourToTripModel(tour);
  }, [tour]);

  if (!open || !tour) return null;

  return (
    <TripEditorModal
      trip={tripModel}
      isOpen={open}
      onClose={() => onOpenChange(false)}
    />
  );
}

