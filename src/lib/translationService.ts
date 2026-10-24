import type { LanguageCode, TripModel, ItineraryItem, TranslationDict } from '@/types/dunas-suite';
import { isBareDayLabel, localizeDayLabel } from '@/lib/dayLabels';
import { getRouteMapDefault, isRouteMapDefaultText } from '@/lib/routeMapDefaults';

export const ALL_LOCALES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export const TARGET_LOCALES: LanguageCode[] = ['en', 'es', 'pt', 'it'];

const translationCache = new Map<string, string>();

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Standard travel phrases dictionary fallback for instant accuracy
 */
const TRAVEL_DICTIONARY: Record<string, Record<LanguageCode, string>> = {
  'الإفطار': { ar: 'الإفطار', en: 'Breakfast', es: 'Desayuno', pt: 'Café da manhã', it: 'Colazione' },
  'إفطار': { ar: 'إفطار', en: 'Breakfast', es: 'Desayuno', pt: 'Café da manhã', it: 'Colazione' },
  'الغداء': { ar: 'الغداء', en: 'Lunch', es: 'Almuerzo', pt: 'Almoço', it: 'Pranzo' },
  'العشاء': { ar: 'العشاء', en: 'Dinner', es: 'Cena', pt: 'Jantar', it: 'Cena' },
  'إفطار وغداء': { ar: 'إفطار وغداء', en: 'Breakfast & Lunch', es: 'Desayuno y Almuerzo', pt: 'Café da manhã e Almoço', it: 'Colazione e Pranzo' },
  'إفطار وعشاء': { ar: 'إفطار وعشاء', en: 'Breakfast & Dinner', es: 'Desayuno y Cena', pt: 'Café da manhã e Jantar', it: 'Colazione e Cena' },
  'شامل كلياً': { ar: 'شامل كلياً', en: 'All-Inclusive', es: 'Todo Incluido', pt: 'Tudo Incluído', it: 'Tutto Incluso' },
  'مغادرات يومية': { ar: 'مغادرات يومية', en: 'Daily Departures', es: 'Salidas Diarias', pt: 'Saídas Diárias', it: 'Partenze Giornaliere' },
  'مغادرات أسبوعية': { ar: 'مغادرات أسبوعية', en: 'Weekly Departures', es: 'Salidas Semanales', pt: 'Saídas Semanais', it: 'Partenze Settimanali' },
  'طوال العام': { ar: 'طوال العام', en: 'All Year Round', es: 'Todo el Año', pt: 'O Ano Todo', it: 'Tutto l\'Anno' },
};

/**
 * Translate a single text string from sourceLang to targetLang.
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = 'ar'
): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  if (targetLang === sourceLang) return trimmed;

  // Check travel dictionary
  if (TRAVEL_DICTIONARY[trimmed]?.[targetLang]) {
    return TRAVEL_DICTIONARY[trimmed][targetLang];
  }

  const cacheKey = `${sourceLang}->${targetLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Try MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const result = data?.responseData?.translatedText || '';
      if (
        result &&
        !result.toLowerCase().includes('quota exceeded') &&
        !result.toLowerCase().includes('mymemory warning') &&
        !result.toLowerCase().includes('is invalid')
      ) {
        const decoded = decodeHtmlEntities(result);
        translationCache.set(cacheKey, decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn(`[Translation] MyMemory failed for ${sourceLang}->${targetLang}:`, e);
  }

  // 2. Try Lingva / Public Fallback
  try {
    const lingvaUrl = `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(trimmed)}`;
    const lingvaRes = await fetch(lingvaUrl);
    if (lingvaRes.ok) {
      const lingvaData = await lingvaRes.json();
      if (lingvaData?.translation) {
        const decoded = decodeHtmlEntities(lingvaData.translation);
        translationCache.set(cacheKey, decoded);
        return decoded;
      }
    }
  } catch (e) {
    // ignore
  }

  return trimmed;
}

/**
 * Translate a single text into specified target languages (defaults to all other 4).
 */
export async function translateToAllLocales(
  text: string,
  sourceLang: LanguageCode = 'ar',
  targetLocales: LanguageCode[] = TARGET_LOCALES
): Promise<Record<LanguageCode, string>> {
  const trimmed = (text || '').trim();
  const results: Partial<Record<LanguageCode, string>> = { [sourceLang]: trimmed };

  const targets = targetLocales.filter(c => c !== sourceLang);
  await Promise.all(
    targets.map(async (target) => {
      results[target] = await translateText(trimmed, target, sourceLang);
    })
  );

  return results as Record<LanguageCode, string>;
}

/**
 * Translate an array of string items (e.g. Highlights, Inclusions, Exclusions).
 */
export async function translateArrayToLocale(
  items: string[],
  targetLang: LanguageCode,
  sourceLang: LanguageCode = 'ar'
): Promise<string[]> {
  if (targetLang === sourceLang) return [...items];
  const validItems = items.map(i => (i || '').trim()).filter(Boolean);
  return Promise.all(validItems.map(item => translateText(item, targetLang, sourceLang)));
}

/**
 * Clears/Empties the translation data for the specified language(s).
 */
export function clearLocaleContent(
  formData: TripModel,
  localesToClear: LanguageCode[]
): TripModel {
  const cloned: TripModel = JSON.parse(JSON.stringify(formData));
  if (!cloned.translations) {
    cloned.translations = { ar: {}, en: {}, es: {}, pt: {}, it: {} };
  }

  localesToClear.forEach(loc => {
    if (loc === 'ar') {
      cloned.title = '';
      cloned.subtitle = '';
      cloned.overview = '';
      cloned.duration = '';
      cloned.departures = '';
      cloned.highlights = [];
      cloned.included = [];
      cloned.excluded = [];
      cloned.itinerary = (cloned.itinerary || []).map((day, idx) => ({
        day: idx + 1,
        title: localizeDayLabel('ar', idx + 1),
        description: '',
        meals: '',
      }));
      cloned.translations.ar = {
        title: '',
        subtitle: '',
        overview: '',
        duration: '',
        departures: '',
        highlights: [],
        included: [],
        excluded: [],
        itinerary: [],
      };
    } else {
      cloned.translations[loc] = {
        title: '',
        subtitle: '',
        overview: '',
        duration: '',
        departures: '',
        highlights: [],
        included: [],
        excluded: [],
        itinerary: (cloned.itinerary || []).map((day, idx) => ({
          day: idx + 1,
          title: localizeDayLabel(loc, idx + 1),
          description: '',
          meals: '',
        })),
      };
    }
  });

  return cloned;
}

/**
 * Route-map headings are generic section copy, so prefer the canonical
 * translation for the target language when the source is still a default.
 */
async function resolveRouteMapHeading(
  value: string | undefined,
  field: 'title' | 'subtitle',
  targetLang: LanguageCode,
  sourceLang: LanguageCode
): Promise<string> {
  if (!value || isRouteMapDefaultText(value, field)) {
    return getRouteMapDefault(targetLang, field);
  }
  const translated = await translateText(value, targetLang, sourceLang);
  return translated || getRouteMapDefault(targetLang, field);
}

/**
 * Full auto-translate for a TripModel from Arabic (or sourceLang) into selected or all target languages.
 * Populates trip.translations[en|es|pt|it] with complete structure.
 */
export async function autoTranslateFullTrip(
  formData: TripModel,
  sourceLang: LanguageCode = 'ar',
  targetLocales: LanguageCode[] = TARGET_LOCALES,
  onProgress?: (step: string, percent: number) => void
): Promise<TripModel> {
  const cloned: TripModel = JSON.parse(JSON.stringify(formData));
  if (!cloned.translations) {
    cloned.translations = { ar: {}, en: {}, es: {}, pt: {}, it: {} };
  }

  // Determine source texts
  const sourceTitle = (sourceLang === 'ar' ? cloned.title : cloned.translations?.[sourceLang]?.title) || cloned.title || '';
  const sourceSubtitle = (sourceLang === 'ar' ? cloned.subtitle : cloned.translations?.[sourceLang]?.subtitle) || cloned.subtitle || '';
  const sourceOverview = (sourceLang === 'ar' ? cloned.overview : cloned.translations?.[sourceLang]?.overview) || cloned.overview || '';
  const sourceDuration = (sourceLang === 'ar' ? cloned.duration : cloned.translations?.[sourceLang]?.duration) || cloned.duration || '';
  const sourceDepartures = (sourceLang === 'ar' ? cloned.departures : cloned.translations?.[sourceLang]?.departures) || cloned.departures || '';
  const sourceHighlights = (sourceLang === 'ar' ? cloned.highlights : cloned.translations?.[sourceLang]?.highlights) || cloned.highlights || [];
  const sourceIncluded = (sourceLang === 'ar' ? cloned.included : cloned.translations?.[sourceLang]?.included) || cloned.included || [];
  const sourceExcluded = (sourceLang === 'ar' ? cloned.excluded : cloned.translations?.[sourceLang]?.excluded) || cloned.excluded || [];
  const sourceItinerary = cloned.itinerary || [];

  const targets = targetLocales.filter(c => c !== sourceLang);

  // 1. Translate Titles, Subtitle, Overview, Duration & Departures
  onProgress?.('جاري ترجمة العناوين والوصف العام والتفاصيل...', 20);
  await Promise.all(
    targets.map(async (lang) => {
      const trans: TranslationDict = cloned.translations[lang] || {};
      const [title, subtitle, overview, duration, departures] = await Promise.all([
        translateText(sourceTitle, lang, sourceLang),
        translateText(sourceSubtitle, lang, sourceLang),
        translateText(sourceOverview, lang, sourceLang),
        translateText(sourceDuration, lang, sourceLang),
        translateText(sourceDepartures, lang, sourceLang),
      ]);
      trans.title = title;
      trans.subtitle = subtitle;
      trans.overview = overview;
      trans.duration = duration;
      trans.departures = departures;
      cloned.translations[lang] = trans;
    })
  );

  // 2. Translate Highlights, Inclusions, Exclusions
  onProgress?.('جاري ترجمة المشتملات والمميزات والخدمات المستثناة...', 55);
  await Promise.all(
    targets.map(async (lang) => {
      const trans: TranslationDict = cloned.translations[lang] || {};
      const [highlights, included, excluded] = await Promise.all([
        translateArrayToLocale(sourceHighlights, lang, sourceLang),
        translateArrayToLocale(sourceIncluded, lang, sourceLang),
        translateArrayToLocale(sourceExcluded, lang, sourceLang),
      ]);
      trans.highlights = highlights;
      trans.included = included;
      trans.excluded = excluded;
      cloned.translations[lang] = trans;
    })
  );

  // 3. Translate Itinerary Days
  onProgress?.('جاري ترجمة تفاصيل البرنامج اليومي والوجبات...', 85);
  await Promise.all(
    targets.map(async (lang) => {
      const trans: TranslationDict = cloned.translations[lang] || {};
      const translatedItinerary: ItineraryItem[] = await Promise.all(
        sourceItinerary.map(async (day, idx) => {
          const [title, description, meals] = await Promise.all([
            translateText(day.title || '', lang, sourceLang),
            translateText(day.description || '', lang, sourceLang),
            translateText(day.meals || '', lang, sourceLang),
          ]);
          const dayNumber = day.day || idx + 1;
          let resolvedTitle = title || day.title || '';
          if (!resolvedTitle?.trim() || isBareDayLabel(resolvedTitle)) {
            resolvedTitle = localizeDayLabel(lang, dayNumber);
          }
          return {
            day: dayNumber,
            // The machine translator is unreliable for bare labels ("Day 1"),
            // so rebuild them from the target locale instead.
            title: resolvedTitle,
            description: description || day.description,
            meals: meals || day.meals,
          };
        })
      );
      trans.itinerary = translatedItinerary;
      cloned.translations[lang] = trans;
    })
  );

  // 4. Translate Interactive Route Map
  const sourceRouteMap = cloned.routeMap;
  if (sourceRouteMap?.locations && sourceRouteMap.locations.length > 0) {
    onProgress?.('جاري ترجمة الخريطة التفاعلية والمدن...', 92);
    await Promise.all(
      targets.map(async (lang) => {
        const trans: TranslationDict = cloned.translations[lang] || {};
        const translatedLocations = await Promise.all(
          sourceRouteMap.locations.map(async (loc) => {
            const [name, description] = await Promise.all([
              translateText(loc.name || '', lang, sourceLang),
              translateText(loc.description || '', lang, sourceLang),
            ]);
            return {
              dbKey: loc.dbKey,
              lat: loc.lat,
              lng: loc.lng,
              daysVisited: loc.daysVisited,
              name: name || loc.name,
              description: description || loc.description,
            };
          })
        );
        const [title, subtitle] = await Promise.all([
          resolveRouteMapHeading(sourceRouteMap.title, 'title', lang, sourceLang),
          resolveRouteMapHeading(sourceRouteMap.subtitle, 'subtitle', lang, sourceLang),
        ]);
        trans.routeMap = {
          title,
          subtitle,
          locations: translatedLocations,
        };
        cloned.translations[lang] = trans;
      })
    );
  }

  // Ensure source language is also mirrored
  if (sourceLang === 'ar') {
    cloned.translations.ar = {
      title: sourceTitle,
      subtitle: sourceSubtitle,
      overview: sourceOverview,
      duration: sourceDuration,
      departures: sourceDepartures,
      highlights: [...sourceHighlights],
      included: [...sourceIncluded],
      excluded: [...sourceExcluded],
      itinerary: sourceItinerary.map(d => ({ ...d })),
      routeMap: sourceRouteMap ? {
        title: sourceRouteMap.title && !isRouteMapDefaultText(sourceRouteMap.title, 'title')
          ? sourceRouteMap.title
          : getRouteMapDefault(sourceLang, 'title'),
        subtitle: sourceRouteMap.subtitle && !isRouteMapDefaultText(sourceRouteMap.subtitle, 'subtitle')
          ? sourceRouteMap.subtitle
          : getRouteMapDefault(sourceLang, 'subtitle'),
        locations: sourceRouteMap.locations.map(loc => ({ ...loc })),
      } : undefined,
    };
  }

  onProgress?.('تمت الترجمة بنجاح!', 100);
  return cloned;
}

/**
 * Universal auto-translator for entities with 5 language fields (like Hotels, Vehicles, Services).
 * Detects the first populated language for Name and Description, and translates only the empty fields.
 */
export async function autoTranslateMissingEntityFields<T extends Record<string, any>>(
  currentData: T,
  options?: {
    nameKeys?: { ar: string; en: string; es: string; pt: string; it: string };
    descKeys?: { ar: string; en: string; es: string; pt: string; it: string };
    fallbackName?: string;
    fallbackDesc?: string;
  }
): Promise<T> {
  const result: T = { ...currentData };
  const nameKeys = options?.nameKeys || { ar: 'nameAr', en: 'nameEn', es: 'nameEs', pt: 'namePt', it: 'nameIt' };
  const descKeys = options?.descKeys || { ar: 'descAr', en: 'descEn', es: 'descEs', pt: 'descPt', it: 'descIt' };

  // 1. Detect Source for Name
  const allLangs: LanguageCode[] = ['ar', 'en', 'es', 'pt', 'it'];
  let sourceName = '';
  let sourceNameLang: LanguageCode = 'ar';

  for (const lang of allLangs) {
    const key = (nameKeys as any)[lang];
    const val = (result[key] || '').trim();
    if (val) {
      sourceName = val;
      sourceNameLang = lang;
      break;
    }
  }

  if (!sourceName && options?.fallbackName?.trim()) {
    sourceName = options.fallbackName.trim();
    // Detect if fallbackName is Arabic or English
    const hasArabicChars = /[\u0600-\u06FF]/.test(sourceName);
    sourceNameLang = hasArabicChars ? 'ar' : 'en';
    const primaryKey = (nameKeys as any)[sourceNameLang];
    if (primaryKey && !result[primaryKey]) {
      (result as any)[primaryKey] = sourceName;
    }
  }

  // 2. Translate Missing Names
  if (sourceName) {
    await Promise.all(
      allLangs.map(async (lang) => {
        const key = (nameKeys as any)[lang];
        if (!result[key] || !String(result[key]).trim()) {
          (result as any)[key] = await translateText(sourceName, lang, sourceNameLang);
        }
      })
    );
  }

  // 3. Detect Source for Description
  let sourceDesc = '';
  let sourceDescLang: LanguageCode = 'ar';

  for (const lang of allLangs) {
    const key = (descKeys as any)[lang];
    const val = (result[key] || '').trim();
    if (val) {
      sourceDesc = val;
      sourceDescLang = lang;
      break;
    }
  }

  if (!sourceDesc && options?.fallbackDesc?.trim()) {
    sourceDesc = options.fallbackDesc.trim();
    const hasArabicChars = /[\u0600-\u06FF]/.test(sourceDesc);
    sourceDescLang = hasArabicChars ? 'ar' : 'en';
    const primaryKey = (descKeys as any)[sourceDescLang];
    if (primaryKey && !result[primaryKey]) {
      (result as any)[primaryKey] = sourceDesc;
    }
  }

  // 4. Translate Missing Descriptions
  if (sourceDesc) {
    await Promise.all(
      allLangs.map(async (lang) => {
        const key = (descKeys as any)[lang];
        if (!result[key] || !String(result[key]).trim()) {
          (result as any)[key] = await translateText(sourceDesc, lang, sourceDescLang);
        }
      })
    );
  }

  return result;
}

