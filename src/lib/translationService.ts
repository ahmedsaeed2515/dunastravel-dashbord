import type { LanguageCode, TripModel, ItineraryItem } from '@/types/dunas-suite';

export const ALL_LOCALES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const translationCache = new Map<string, string>();

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

  const cacheKey = `${sourceLang}->${targetLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const result = data?.responseData?.translatedText || '';
    if (result && !result.toLowerCase().includes('quota exceeded') && !result.toLowerCase().includes('mymemory warning')) {
      const decoded = result
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      translationCache.set(cacheKey, decoded);
      return decoded;
    }
  } catch (e) {
    console.warn(`Translation error for ${sourceLang}->${targetLang}:`, e);
  }

  return trimmed;
}

/**
 * Translate a single text into all other 4 target languages in parallel.
 */
export async function translateToAllLocales(
  text: string,
  sourceLang: LanguageCode = 'ar'
): Promise<Record<LanguageCode, string>> {
  const trimmed = (text || '').trim();
  const results: Record<string, string> = { [sourceLang]: trimmed };

  const targets = ALL_LOCALES.map(l => l.code).filter(c => c !== sourceLang);
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
  return Promise.all(items.map(item => translateText(item, targetLang, sourceLang)));
}

/**
 * Full auto-translate for a TripModel into all 5 languages simultaneously.
 * Populates trip.translations[en|es|pt|it] with complete structure.
 */
export async function autoTranslateFullTrip(
  formData: TripModel,
  sourceLang: LanguageCode = 'ar',
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
  const sourceHighlights = (sourceLang === 'ar' ? cloned.highlights : cloned.translations?.[sourceLang]?.highlights) || cloned.highlights || [];
  const sourceIncluded = (sourceLang === 'ar' ? cloned.included : cloned.translations?.[sourceLang]?.included) || cloned.included || [];
  const sourceExcluded = (sourceLang === 'ar' ? cloned.excluded : cloned.translations?.[sourceLang]?.excluded) || cloned.excluded || [];
  const sourceItinerary = cloned.itinerary || [];

  const targetLocales = ALL_LOCALES.map(l => l.code).filter(c => c !== sourceLang);

  // 1. Translate Titles & Overview
  onProgress?.('جاري ترجمة العناوين والوصف العام...', 20);
  await Promise.all(
    targetLocales.map(async (lang) => {
      const trans = cloned.translations[lang] || {};
      const [title, subtitle, overview, duration] = await Promise.all([
        translateText(sourceTitle, lang, sourceLang),
        translateText(sourceSubtitle, lang, sourceLang),
        translateText(sourceOverview, lang, sourceLang),
        translateText(sourceDuration, lang, sourceLang),
      ]);
      trans.title = title;
      trans.subtitle = subtitle;
      trans.overview = overview;
      trans.duration = duration;
      cloned.translations[lang] = trans;
    })
  );

  // 2. Translate Highlights, Inclusions, Exclusions
  onProgress?.('جاري ترجمة المشتملات والمميزات...', 50);
  await Promise.all(
    targetLocales.map(async (lang) => {
      const trans = cloned.translations[lang] || {};
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
  onProgress?.('جاري ترجمة البرنامج اليومي...', 80);
  await Promise.all(
    targetLocales.map(async (lang) => {
      const trans = cloned.translations[lang] || {};
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
      highlights: [...sourceHighlights],
      included: [...sourceIncluded],
      excluded: [...sourceExcluded],
      itinerary: sourceItinerary.map(d => ({ ...d })),
    };
  }

  onProgress?.('تمت الترجمة بنجاح!', 100);
  return cloned;
}