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
    .filter((image): image is string => /^https?:\/\//i.test(image.trim()))
    .filter((image, index, values) => values.indexOf(image) === index)
    .map((imageUrl, index) => ({ imageUrl, isHero: index === 0, sortOrder: index }));
  const itinerary = (formData.itinerary ?? []).map((day, index) => ({
    dayLabel: text(day.title) || `Day ${day.day || index + 1}`,
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
  const city = formData.accommodation?.[0]?.destination?.trim() || null;

  return {
    slug: text(formData.slug),
    titleJsonb: localizedText(translations, 'title', formData.title),
    subtitleJsonb: localizedText(translations, 'subtitle', formData.subtitle),
    overviewJsonb: localizedText(translations, 'overview', formData.overview),
    durationJsonb: localizedText(translations, 'duration', formData.duration),
    category: text(formData.type) || null,
    country: countryForDestination(text(formData.destination)),
    city,
    basePriceUsd: Number.isFinite(price) && price >= 0 ? price : 0,
    currency: 'USD',
    isFeatured: Boolean(formData.popular),
    ...(isNew ? { status: 'DRAFT' as const, isActive: false } : {}),
    includedServicesJsonb: localizedList(translations, 'included', formData.included),
    excludedServicesJsonb: localizedList(translations, 'excluded', formData.excluded),
    highlightsJsonb: localizedList(translations, 'highlights', formData.highlights),
    itineraries: itinerary,
    images,
  };
}
