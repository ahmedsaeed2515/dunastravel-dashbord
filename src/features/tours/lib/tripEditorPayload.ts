import type {
  AccommodationItem,
  LanguageCode,
  SeasonPricingRuleItem,
  TranslationDict,
  TripModel,
} from '@/types/dunas-suite';
import type { CreateTourPayload, Tour } from '../types';

const LOCALES: LanguageCode[] = ['ar', 'en', 'es', 'pt', 'it'];

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : [];
}

function countryForDestination(destination: string): string | null {
  const canonical = destination.trim().toLowerCase();
  return {
    egypt: 'Egypt',
    turkey: 'Turkey',
    jordan: 'Jordan',
    morocco: 'Morocco',
    dubai: 'United Arab Emirates',
    tunisia: 'Tunisia',
    greece: 'Greece',
    'multi-country': 'Multi-Country',
  }[canonical] ?? null;
}

function destinationSlugForCountry(country: string | null | undefined): string {
  const normalized = (country ?? '').trim().toLowerCase();
  if (!normalized) return 'egypt';
  return (
    {
      egypt: 'egypt',
      turkey: 'turkey',
      jordan: 'jordan',
      morocco: 'morocco',
      'united arab emirates': 'dubai',
      uae: 'dubai',
      dubai: 'dubai',
      tunisia: 'tunisia',
      greece: 'greece',
      'multi country': 'multi-country',
      'multi-country': 'multi-country',
    }[normalized] || normalized
  );
}

function translation(
  translations: TripModel['translations'] | undefined,
  locale: LanguageCode,
): TranslationDict {
  return translations?.[locale] ?? {};
}

function localizedText(
  translations: TripModel['translations'] | undefined,
  field: 'title' | 'subtitle' | 'overview' | 'duration' | 'departures',
  arabicValue: unknown,
): Record<LanguageCode, string> {
  return Object.fromEntries(LOCALES.map((locale) => [
    locale,
    locale === 'ar' ? text(arabicValue) : text(translation(translations, locale)[field]),
  ])) as Record<LanguageCode, string>;
}

function localizedList(
  translations: TripModel['translations'] | undefined,
  field: 'highlights' | 'included' | 'excluded',
  arabicValue: unknown,
): Record<LanguageCode, string[]> {
  return Object.fromEntries(LOCALES.map((locale) => [
    locale,
    locale === 'ar' ? list(arabicValue) : list(translation(translations, locale)[field]),
  ])) as Record<LanguageCode, string[]>;
}

function extractLocaleText(value: Record<string, any> | null | undefined, locale: string): string {
  return typeof value?.[locale] === 'string' ? (value[locale] as string) : '';
}

function extractLocaleList(value: Record<string, any> | any[] | null | undefined, locale: string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return item[locale] || item.en || item.ar || item.es || Object.values(item)[0] || '';
        }
        return typeof item === 'string' ? item : '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    const raw = value[locale];
    if (Array.isArray(raw)) {
      return raw
        .map((item: any) => (typeof item === 'string' ? item : item?.[locale] || item?.en || ''))
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Canonical, lossless mapper from a backend `Tour` record to `TripModel`.
 * Preserves relational `accommodations`, `seasonPricingJsonb.rules`, 5-locale `itineraries` (`titleJsonb`),
 * `hotelCategory`, `hotels` notes, `departures`, `market`, `tags`, and hero image ordering.
 */
export function tourToTripModel(
  tour: Tour,
  canonFallback?: Record<string, any> | null,
): TripModel {
  const canon = canonFallback ?? null;
  const hasItems = (v: any) =>
    Array.isArray(v) ? v.length > 0 : v && typeof v === 'object' ? Object.keys(v).length > 0 : Boolean(v);

  const rawHighlights = hasItems(tour.highlightsJsonb)
    ? tour.highlightsJsonb
    : hasItems(tour.highlightJsonb)
      ? tour.highlightJsonb
      : hasItems((tour as any).highlights)
        ? (tour as any).highlights
        : canon?.highlights;
  const rawIncluded = hasItems(tour.includedServicesJsonb)
    ? tour.includedServicesJsonb
    : hasItems(tour.inclusionJsonb)
      ? tour.inclusionJsonb
      : hasItems((tour as any).includedServices)
        ? (tour as any).includedServices
        : hasItems((tour as any).included)
          ? (tour as any).included
          : canon?.included || canon?.includes;
  const rawExcluded = hasItems(tour.excludedServicesJsonb)
    ? tour.excludedServicesJsonb
    : hasItems(tour.exclusionJsonb)
      ? tour.exclusionJsonb
      : hasItems((tour as any).excludedServices)
        ? (tour as any).excludedServices
        : hasItems((tour as any).excluded)
          ? (tour as any).excluded
          : canon?.excluded || canon?.excludes;

  const rawItinerary =
    Array.isArray(tour.itineraries) && tour.itineraries.length > 0
      ? tour.itineraries
      : Array.isArray(canon?.days) && canon.days.length > 0
        ? canon.days
        : Array.isArray(canon?.itinerary) && canon.itinerary.length > 0
          ? canon.itinerary
          : [];

  const itinerary = rawItinerary.map((item: any, index: number) => ({
    day: item.day || (item.sortOrder !== undefined ? item.sortOrder + 1 : index + 1),
    title:
      extractLocaleText(item.titleJsonb, 'ar') ||
      item.dayLabel ||
      extractLocaleText(item.titleJsonb, 'en') ||
      (typeof item.title === 'object' ? item.title?.ar || item.title?.en : item.title) ||
      `اليوم ${index + 1}`,
    description:
      extractLocaleText(item.descriptionJsonb, 'ar') ||
      (typeof item.description === 'object' ? item.description?.ar || item.description?.en : item.description) ||
      '',
    meals:
      extractLocaleText(item.mealsJsonb, 'ar') ||
      (typeof item.meals === 'object' ? item.meals?.ar || item.meals?.en : item.meals) ||
      '',
  }));

  const rawImages =
    Array.isArray(tour.images) && tour.images.length > 0
      ? tour.images.map((image: { imageUrl?: string }) => image.imageUrl || '').filter(Boolean)
      : Array.isArray(canon?.images) && canon.images.length > 0
        ? canon.images
        : tour.heroImage
          ? [tour.heroImage]
          : canon?.heroImage
            ? [canon.heroImage]
            : [];

  const heroFromImages = Array.isArray(tour.images)
    ? tour.images.find((img: any) => img?.isHero)?.imageUrl
    : undefined;
  const resolvedHero =
    heroFromImages ||
    (typeof tour.heroImage === 'string' ? tour.heroImage : '') ||
    (typeof (tour as any).heroImageUrl === 'string' ? (tour as any).heroImageUrl : '') ||
    rawImages[0] ||
    '';

  let images = [...rawImages];
  if (resolvedHero && images.includes(resolvedHero)) {
    images = [resolvedHero, ...images.filter((img) => img !== resolvedHero)];
  } else if (resolvedHero && !images.includes(resolvedHero)) {
    images = [resolvedHero, ...images];
  }

  const hotelInfo =
    tour.hotelInfoJsonb && typeof tour.hotelInfoJsonb === 'object' && !Array.isArray(tour.hotelInfoJsonb)
      ? (tour.hotelInfoJsonb as Record<string, any>)
      : {};

  const jsonbAccommodations = Array.isArray(hotelInfo.accommodations)
    ? hotelInfo.accommodations
    : Array.isArray(hotelInfo.accommodation)
      ? hotelInfo.accommodation
      : [];

  const accommodation: AccommodationItem[] =
    Array.isArray(tour.accommodations) && tour.accommodations.length > 0
      ? tour.accommodations.map((acc: any, idx: number) => ({
          id: acc.id,
          hotelId: acc.hotelId,
          roomId: acc.roomId ?? null,
          destination: acc.destination || acc.hotel?.city || tour.city || 'Egypt',
          nights: Math.max(1, Number(acc.nights) || 1),
          regime: acc.regime || acc.boardBasis || 'BB',
          categoryTier: acc.categoryTier || '5_STAR',
          priceSupplementUsd: Number(acc.priceSupplementUsd ?? acc.priceSupplement ?? 0) || 0,
          isDefault: acc.isDefault ?? idx === 0,
          sortOrder: acc.sortOrder ?? idx,
        }))
      : jsonbAccommodations.map((acc: any, idx: number) => ({
          ...(acc.id ? { id: acc.id } : {}),
          ...(acc.hotelId ? { hotelId: acc.hotelId } : {}),
          ...(acc.roomId !== undefined ? { roomId: acc.roomId } : {}),
          destination: text(acc.destination) || tour.city || 'Egypt',
          nights: Math.max(1, Number(acc.nights) || 1),
          regime: text(acc.regime || acc.boardBasis) || 'BB',
          ...(acc.categoryTier ? { categoryTier: text(acc.categoryTier) } : {}),
          ...(acc.priceSupplementUsd !== undefined
            ? { priceSupplementUsd: Number(acc.priceSupplementUsd) || 0 }
            : {}),
          ...(acc.isDefault !== undefined ? { isDefault: Boolean(acc.isDefault) } : { isDefault: idx === 0 }),
          ...(acc.sortOrder !== undefined ? { sortOrder: Number(acc.sortOrder) } : { sortOrder: idx }),
        }));

  const seasonJson = tour.seasonPricingJsonb as any;
  const rawSeasonRules = Array.isArray(seasonJson)
    ? seasonJson
    : Array.isArray(seasonJson?.rules)
      ? seasonJson.rules
      : [];
  const seasonPricing: SeasonPricingRuleItem[] = rawSeasonRules
    .filter((r: any) => Boolean(r && (r.seasonCode || r.startDate || r.endDate)))
    .map((r: any) => {
      const resolvedLabel = text(r.seasonName || r.label || r.seasonCode);
      return {
        ...(r.seasonId ? { seasonId: String(r.seasonId) } : {}),
        seasonCode: text(r.seasonCode),
        seasonName: resolvedLabel,
        label: text(r.label || r.seasonName || r.seasonCode),
        startDate: text(r.startDate),
        endDate: text(r.endDate),
        ...(r.multiplier !== undefined && r.multiplier !== null ? { multiplier: Number(r.multiplier) } : {}),
        ...(r.priceUsd !== undefined && r.priceUsd !== null ? { priceUsd: Number(r.priceUsd) } : {}),
        ...(r.supplementUsd !== undefined && r.supplementUsd !== null
          ? { supplementUsd: Number(r.supplementUsd) }
          : {}),
      };
    });

  const hasExplicitTags = Array.isArray(tour.tags);
  const tagSet = new Set((tour.tags || []).map((t) => String(t).toLowerCase()));

  const relatedDestSlug = tour.landingPages?.find((lp: any) => lp?.type === 'DESTINATION')?.slug?.toLowerCase();
  const destination = relatedDestSlug || destinationSlugForCountry(tour.country || canon?.destination || 'egypt');

  return {
    id: tour.id,
    slug: tour.slug,
    title:
      extractLocaleText(tour.titleJsonb, 'ar') ||
      extractLocaleText(tour.titleJsonb, 'en') ||
      (typeof canon?.title === 'object' ? canon?.title?.ar || canon?.title?.en : canon?.title) ||
      tour.slug,
    subtitle: extractLocaleText(tour.subtitleJsonb, 'ar') || extractLocaleText(tour.subtitleJsonb, 'en') || '',
    destination,
    market: tour.market || 'Global',
    language: 'ar',
    type: (tour.category || canon?.type || 'Classic') as any,
    duration:
      extractLocaleText(tour.durationJsonb, 'ar') ||
      extractLocaleText(tour.durationJsonb, 'en') ||
      (typeof canon?.duration === 'object' ? canon?.duration?.ar || canon?.duration?.en : canon?.duration) ||
      '',
    departures:
      extractLocaleText(tour.departureInfoJsonb, 'ar') ||
      extractLocaleText(tour.departureInfoJsonb, 'en') ||
      'Daily / Diário',
    price:
      tour.basePriceUsd !== undefined && tour.basePriceUsd !== null && !isNaN(Number(tour.basePriceUsd))
        ? Number(tour.basePriceUsd)
        : Number(canon?.price ?? 0),
    hotelCategory: typeof hotelInfo.hotelCategory === 'string' ? hotelInfo.hotelCategory : '',
    rating: Number(tour.sourceRating || 4.9),
    reviewCount: Number(tour.sourceReviewCount ?? tour.reviewCount ?? 0),
    popular: Boolean(tour.isFeatured || tagSet.has('popular')),
    familyFriendly: hasExplicitTags ? tagSet.has('family') || tagSet.has('familyfriendly') : false,
    honeymoon: hasExplicitTags ? tagSet.has('honeymoon') || tagSet.has('egypt-honeymoon') : false,
    luxury: hasExplicitTags ? tagSet.has('luxury') : Boolean(tour.isFeatured),
    cultural: hasExplicitTags ? tagSet.has('cultural') || tagSet.has('egypt-classic') : false,
    adventure: hasExplicitTags ? tagSet.has('adventure') || tagSet.has('egypt-extensions') : false,
    overview:
      extractLocaleText(tour.overviewJsonb, 'ar') ||
      extractLocaleText(tour.overviewJsonb, 'en') ||
      (typeof canon?.overview === 'object' ? canon?.overview?.ar || canon?.overview?.en : canon?.overview) ||
      '',
    highlights: extractLocaleList(rawHighlights, 'ar'),
    included: extractLocaleList(rawIncluded, 'ar'),
    excluded: extractLocaleList(rawExcluded, 'ar'),
    heroImage: resolvedHero,
    images,
    hotels: typeof hotelInfo.notes === 'string' ? hotelInfo.notes : '',
    accommodation,
    seasonPricing,
    itinerary,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        {
          title:
            extractLocaleText(tour.titleJsonb, locale) ||
            (typeof canon?.title === 'object' ? canon?.title?.[locale] || canon?.title?.en : '') ||
            '',
          subtitle: extractLocaleText(tour.subtitleJsonb, locale) || '',
          overview:
            extractLocaleText(tour.overviewJsonb, locale) ||
            (typeof canon?.overview === 'object' ? canon?.overview?.[locale] || canon?.overview?.en : '') ||
            '',
          duration:
            extractLocaleText(tour.durationJsonb, locale) ||
            (typeof canon?.duration === 'object' ? canon?.duration?.[locale] || canon?.duration?.en : '') ||
            '',
          departures: extractLocaleText(tour.departureInfoJsonb, locale) || '',
          highlights: extractLocaleList(rawHighlights, locale),
          included: extractLocaleList(rawIncluded, locale),
          excluded: extractLocaleList(rawExcluded, locale),
          itinerary: rawItinerary.map((item: any, index: number) => ({
            day: item.day || (item.sortOrder !== undefined ? item.sortOrder + 1 : index + 1),
            title:
              extractLocaleText(item.titleJsonb, locale) ||
              item.dayLabel ||
              (typeof item.title === 'object' ? item.title?.[locale] || item.title?.en : item.title) ||
              '',
            description:
              extractLocaleText(item.descriptionJsonb, locale) ||
              (typeof item.description === 'object'
                ? item.description?.[locale] || item.description?.en
                : item.description) ||
              '',
            meals:
              extractLocaleText(item.mealsJsonb, locale) ||
              (typeof item.meals === 'object' ? item.meals?.[locale] || item.meals?.en : item.meals) ||
              '',
          })),
        },
      ]),
    ) as TripModel['translations'],
  };
}

/** Builds a full JSONB update without copying Arabic text into another locale. */
export function buildTripEditorPayload(
  formData: Partial<TripModel>,
  isNew: boolean,
): CreateTourPayload {
  const translations = formData.translations;
  const validImages = (formData.images ?? [])
    .filter((image): image is string => typeof image === 'string' && /^https?:\/\//i.test(image.trim()))
    .filter((image, index, values) => values.indexOf(image) === index);

  const selectedHero = typeof formData.heroImage === 'string' ? formData.heroImage.trim() : '';
  let orderedImages = [...validImages];
  if (selectedHero && orderedImages.includes(selectedHero)) {
    orderedImages = [selectedHero, ...orderedImages.filter((img) => img !== selectedHero)];
  }

  const images = orderedImages.map((imageUrl, index) => ({
    imageUrl,
    isHero: index === 0,
    sortOrder: index,
  }));

  const itinerary = (formData.itinerary ?? [])
    .filter((day) => Boolean(text(day.title).trim() || text(day.description).trim() || text(day.meals).trim()))
    .map((day, index) => {
      const arDayTitle = text(day.title).trim() || `Day ${day.day || index + 1}`;
      return {
        dayLabel: arDayTitle,
        titleJsonb: Object.fromEntries(LOCALES.map((locale) => [
          locale,
          locale === 'ar'
            ? arDayTitle
            : (text(translation(translations, locale).itinerary?.[index]?.title).trim() || arDayTitle),
        ])),
        descriptionJsonb: Object.fromEntries(LOCALES.map((locale) => [
          locale,
          locale === 'ar'
            ? text(day.description)
            : text(translation(translations, locale).itinerary?.[index]?.description),
        ])),
        mealsJsonb: Object.fromEntries(LOCALES.map((locale) => [
          locale,
          locale === 'ar'
            ? text(day.meals)
            : text(translation(translations, locale).itinerary?.[index]?.meals),
        ])),
        sortOrder: index,
      };
    });

  const price = Number(formData.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('A real base price is required before this tour can be saved.');
  }
  const city = formData.accommodation?.[0]?.destination?.trim() || null;

  const tags: string[] = [];
  if (formData.popular) tags.push('popular');
  if (formData.luxury) tags.push('luxury');
  if (formData.honeymoon) tags.push('honeymoon');
  if (formData.cultural) tags.push('cultural');
  if (formData.adventure) tags.push('adventure');
  if (formData.familyFriendly) tags.push('family');

  const hotelInfoJsonb = (formData.accommodation && formData.accommodation.length > 0) || formData.hotelCategory || formData.hotels
    ? {
        hotelCategory: text(formData.hotelCategory),
        notes: text(formData.hotels),
        accommodation: formData.accommodation ?? [],
      }
    : null;

  const relationalAccommodations = (formData.accommodation ?? [])
    .filter((acc) => typeof acc.hotelId === 'string' && Boolean(acc.hotelId.trim()))
    .map((acc, index) => ({
      hotelId: acc.hotelId!.trim(),
      roomId: acc.roomId && acc.roomId.trim() ? acc.roomId.trim() : null,
      destination: text(acc.destination).trim() || 'Egypt',
      nights: Math.max(1, Number(acc.nights) || 1),
      regime: text(acc.regime).trim() || 'BB',
      categoryTier: text(acc.categoryTier).trim() || '5_STAR',
      priceSupplementUsd: Number(acc.priceSupplementUsd) || 0,
      isDefault: acc.isDefault ?? index === 0,
      sortOrder: index,
    }));

  const seasonPricingRules = (formData.seasonPricing ?? [])
    .filter(
      (rule) => Boolean(text(rule.seasonCode).trim() && text(rule.startDate).trim() && text(rule.endDate).trim()),
    )
    .map((rule) => {
      const resolvedSeasonName = text(rule.seasonName || rule.label).trim() || text(rule.seasonCode).trim();
      return {
        ...rule,
        seasonCode: text(rule.seasonCode).trim(),
        seasonName: resolvedSeasonName,
        ...(rule.label !== undefined ? { label: text(rule.label || rule.seasonName).trim() || resolvedSeasonName } : {}),
        startDate: text(rule.startDate).trim(),
        endDate: text(rule.endDate).trim(),
      };
    });

  const rawRouteLocations = formData.routeMap?.locations ?? [];
  const routeMapLocations = rawRouteLocations.map((loc, idx) => ({
    id: loc.id || `loc-${idx + 1}`,
    dbKey: text(loc.dbKey) || 'cairo',
    lat: Number(loc.lat) || 0,
    lng: Number(loc.lng) || 0,
    daysVisited: Array.isArray(loc.daysVisited)
      ? loc.daysVisited
      : (typeof loc.daysVisited === 'string'
          ? (loc.daysVisited as string).split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
          : []),
    nameJsonb: Object.fromEntries(LOCALES.map((locale) => [
      locale,
      locale === 'ar'
        ? text(loc.name)
        : text(translation(translations, locale).routeMap?.locations?.[idx]?.name) || text(loc.name),
    ])),
    descriptionJsonb: Object.fromEntries(LOCALES.map((locale) => [
      locale,
      locale === 'ar'
        ? text(loc.description)
        : text(translation(translations, locale).routeMap?.locations?.[idx]?.description) || text(loc.description),
    ])),
  }));

  const routeMapJsonb = routeMapLocations.length > 0
    ? {
        titleJsonb: Object.fromEntries(LOCALES.map((locale) => [
          locale,
          locale === 'ar'
            ? text(formData.routeMap?.title) || 'Interactive Itinerary Journey Map'
            : text(translation(translations, locale).routeMap?.title) || 'Interactive Itinerary Journey Map',
        ])),
        subtitleJsonb: Object.fromEntries(LOCALES.map((locale) => [
          locale,
          locale === 'ar'
            ? text(formData.routeMap?.subtitle) || 'Explore your day-by-day path across premier luxury landmarks'
            : text(translation(translations, locale).routeMap?.subtitle) || 'Explore your day-by-day path across premier luxury landmarks',
        ])),
        locations: routeMapLocations,
      }
    : null;

  return {
    slug: text(formData.slug),
    titleJsonb: localizedText(translations, 'title', formData.title),
    subtitleJsonb: localizedText(translations, 'subtitle', formData.subtitle),
    overviewJsonb: localizedText(translations, 'overview', formData.overview),
    durationJsonb: localizedText(translations, 'duration', formData.duration),
    category: text(formData.type) || null,
    country: countryForDestination(text(formData.destination)),
    city,
    market: text(formData.market) || null,
    // An empty array clears stale tags when the final checkbox is unchecked.
    tags,
    basePriceUsd: price,
    currency: 'USD',
    isFeatured: Boolean(formData.popular),
    ...(isNew ? { status: 'DRAFT' as const, isActive: false } : {}),
    hotelInfoJsonb,
    accommodations: relationalAccommodations,
    seasonPricingJsonb: { rules: seasonPricingRules },
    departureInfoJsonb: formData.departures ? localizedText(translations, 'departures', formData.departures) : undefined,
    includedServicesJsonb: localizedList(translations, 'included', formData.included),
    excludedServicesJsonb: localizedList(translations, 'excluded', formData.excluded),
    highlightsJsonb: localizedList(translations, 'highlights', formData.highlights),
    routeMapJsonb,
    itineraries: itinerary,
    images,
  };
}


