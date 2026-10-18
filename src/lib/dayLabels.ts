/**
 * Localized numbered-day labels ("Day 1", "Día 1", "Giorno 1", "Dia 1", "اليوم 1").
 *
 * The dashboard is the source of truth for itinerary data. These helpers make
 * sure a generated day label is written in the correct language for every
 * locale instead of always defaulting to the English "Day N".
 */

export type DayLabelLocale = 'ar' | 'en' | 'es' | 'pt' | 'it' | string;

/** Word used right before the day number, per locale. */
export const DAY_WORD_BY_LOCALE: Record<string, string> = {
  ar: 'اليوم',
  en: 'Day',
  es: 'Día',
  it: 'Giorno',
  pt: 'Dia',
  fr: 'Jour',
  de: 'Tag',
};

/** Matches a label that is *only* a localized word + number (never a real title). */
const BARE_DAY_LABEL_PATTERN =
  /^(?:day|d[ií]a|giorno|jour|dia|اليوم|يوم)\s*#?\s*[0-9٠-٩]+\s*$/iu;

/** Normalizes any i18n locale tag (e.g. "en-US") to a 2-letter code. */
export function normalizeDayLocale(locale: string | null | undefined): string {
  return String(locale || 'en')
    .substring(0, 2)
    .toLowerCase();
}

/** Returns the localized day label, e.g. `localizeDayLabel('es', 2)` -> "Día 2". */
export function localizeDayLabel(
  locale: string | null | undefined,
  dayNumber: number | string,
): string {
  const code = normalizeDayLocale(locale);
  const word = DAY_WORD_BY_LOCALE[code] || DAY_WORD_BY_LOCALE.en;
  return `${word} ${dayNumber}`;
}

/**
 * True only when the value is a bare numbered day label such as "Day 1",
 * "DÍA 3", "giorno 2" or "اليوم 4". Real titles ("DAY 1: TUNIS") return false.
 */
export function isBareDayLabel(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return BARE_DAY_LABEL_PATTERN.test(trimmed);
}
