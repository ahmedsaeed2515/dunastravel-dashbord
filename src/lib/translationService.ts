import type { LanguageCode, TripModel, ItineraryItem, TranslationDict } from '@/types/dunas-suite';

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
        title: `اليوم ${idx + 1}`,
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
          title: `Day ${idx + 1}`,
          description: '',
          meals: '',
        })),
      };
    }
  });

  return cloned;
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
          return {
            day: day.day || idx + 1,
            title: title || day.title,
            description: description || day.description,
            meals: meals || day.meals,
          };
        })
      );
      trans.itinerary = translatedItinerary;
      cloned.translations[lang] = trans;
    })
  );

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
    };
  }

  onProgress?.('تمت الترجمة بنجاح!', 100);
  return cloned;
}
