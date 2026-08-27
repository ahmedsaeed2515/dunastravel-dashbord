import { describe, expect, it } from 'vitest';
import { buildTripEditorPayload } from './tripEditorPayload';

describe('buildTripEditorPayload', () => {
  it('preserves existing non-Arabic content when Arabic is edited', () => {
    const payload = buildTripEditorPayload({
      slug: 'dubai-tour',
      title: 'عنوان عربي جديد',
      destination: 'dubai',
      duration: '',
      price: 0,
      translations: {
        ar: { title: 'عنوان عربي سابق' },
        en: { title: 'Existing English', overview: 'Existing English overview', duration: '4 days' },
        es: { title: 'Título existente' },
        pt: { title: 'Título existente PT' },
        it: { title: 'Titolo esistente' },
      },
    }, false);

    expect(payload.titleJsonb).toEqual({
      ar: 'عنوان عربي جديد',
      en: 'Existing English',
      es: 'Título existente',
      pt: 'Título existente PT',
      it: 'Titolo esistente',
    });
    expect(payload.durationJsonb).toMatchObject({ en: '4 days' });
    expect(payload.country).toBe('United Arab Emirates');
    expect(payload).not.toHaveProperty('status');
  });

  it('creates incomplete tours as drafts without fabricated city, price, itinerary, or media', () => {
    const payload = buildTripEditorPayload({ slug: 'new-tour', title: 'عنوان', destination: 'egypt' }, true);

    expect(payload).toMatchObject({
      status: 'DRAFT',
      isActive: false,
      city: null,
      basePriceUsd: 0,
      itineraries: [],
      images: [],
    });
  });
});
