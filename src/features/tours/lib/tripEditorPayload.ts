import type { LanguageCode, TripModel, TranslationDict } from '@/types/dunas-suite';
import type { CreateTourPayload } from '../types';

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

function translation(
  translations: TripModel['translations'] | undefined,
  locale: LanguageCode,
): TranslationDict {
  return translations?.[locale] ?? {};
}

function localizedText(
  translations: TripModel['translations'] | undefined,
  field: 'title' | 'subtitle' | 'overview' | 'duration',
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

/** Builds a full JSONB update without copying Arabic text into another locale. */
export function buildTripEditorPayload(
  formData: Partial<TripModel>,
  isNew: boolean,
): CreateTourPayload {
  const translations = formData.translations;
  const images = (formData.images ?? [])
    .filter((image): image is string => typeof image === 'string' && /^https?:\/\//i.test(image.trim()))
    .filter((image, index, values) => values.indexOf(image) === index)
    .map((imageUrl, index) => ({ imageUrl, isHero: index === 0, sortOrder: index }));

  const itinerary = (formData.itinerary ?? [])
    .filter((day) => Boolean(text(day.title).trim() || text(day.description).trim() || text(day.meals).trim()))
    .map((day, index) => ({
      dayLabel: text(day.title).trim() || `Day ${day.day || index + 1}`,
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
    }));

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
    tags: tags.length > 0 ? tags : undefined,
    basePriceUsd: price,
    currency: 'USD',
    isFeatured: Boolean(formData.popular),
    ...(isNew ? { status: 'DRAFT' as const, isActive: false } : {}),
    hotelInfoJsonb,
    departureInfoJsonb: formData.departures ? { ar: text(formData.departures), en: text(formData.departures) } : undefined,
    includedServicesJsonb: localizedList(translations, 'included', formData.included),
    excludedServicesJsonb: localizedList(translations, 'excluded', formData.excluded),
    highlightsJsonb: localizedList(translations, 'highlights', formData.highlights),
    itineraries: itinerary,
    images,
  };
}
