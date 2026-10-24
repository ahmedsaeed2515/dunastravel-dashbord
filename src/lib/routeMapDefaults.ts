import type { LanguageCode } from '@/types/dunas-suite';

/**
 * Canonical copy for the Interactive Itinerary Journey Map section.
 *
 * The public site renders this section in the visitor's language, so the
 * dashboard must seed each language tab with the matching translation instead
 * of copying the English defaults into every locale.
 */
export const ROUTE_MAP_DEFAULTS: Record<LanguageCode, { title: string; subtitle: string }> = {
  ar: {
    title: 'خريطة خط سير الرحلة التفاعلية',
    subtitle: 'استكشف مسار رحلتك يوماً بيوم عبر أهم المعالم والمحطات الفاخرة',
  },
  en: {
    title: 'Interactive Itinerary Journey Map',
    subtitle: 'Explore your day-by-day path across premier luxury landmarks',
  },
  es: {
    title: 'Mapa Interactivo del Itinerario de Viaje',
    subtitle: 'Explore su ruta día a día a través de destacados lugares de lujo',
  },
  it: {
    title: "Mappa Interattiva dell'Itinerario",
    subtitle: 'Esplora il tuo percorso giorno per giorno attraverso i luoghi di lusso',
  },
  pt: {
    title: 'Mapa Interativo do Roteiro de Viagem',
    subtitle: 'Explore seu trajeto dia a dia pelos principais pontos turísticos de luxo',
  },
};

const normalizeLocale = (lang?: string | null): LanguageCode => {
  const code = String(lang || 'en').split('-')[0].toLowerCase();
  return (ROUTE_MAP_DEFAULTS[code as LanguageCode] ? code : 'en') as LanguageCode;
};

export const getRouteMapDefault = (
  lang: string | null | undefined,
  field: 'title' | 'subtitle'
): string => ROUTE_MAP_DEFAULTS[normalizeLocale(lang)][field];

/** True when the value is empty or still one of the known default translations. */
export const isRouteMapDefaultText = (
  value: string | null | undefined,
  field: 'title' | 'subtitle'
): boolean => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return true;
  return Object.values(ROUTE_MAP_DEFAULTS).some(
    (entry) => entry[field].trim().toLowerCase() === normalized
  );
};
