import { Tour } from '@/features/tours/types';

/**
 * Universal safe extractor for tour lists from backend API responses.
 * Handles:
 * - Direct Array: [tour1, tour2, ...]
 * - Paginated / Items format: { items: [tour1, tour2, ...], total: 62 }
 * - Data Envelope: { data: [tour1, tour2, ...], meta: { ... } }
 * - Nested Data Items: { data: { items: [tour1, tour2, ...] } }
 */
export function extractToursList(raw: unknown): Tour[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Tour[];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as Tour[];
  if (Array.isArray(obj.data)) return obj.data as Tour[];
  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items as Tour[];
    if (Array.isArray(nested.data)) return nested.data as Tour[];
  }
  return [];
}
