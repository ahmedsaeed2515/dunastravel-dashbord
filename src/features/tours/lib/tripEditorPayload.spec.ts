import { describe, expect, it } from 'vitest';
import { buildTripEditorPayload } from './tripEditorPayload';

describe('buildTripEditorPayload', () => {
  it('preserves existing non-Arabic content when Arabic is edited', () => {
    const payload = buildTripEditorPayload({
      slug: 'dubai-tour',
      title: 'Arabic title',
      destination: 'dubai',
      duration: '',
      price: 0,
      translations: {
        ar: { title: 'Previous Arabic title' },
        en: { title: 'Existing English', overview: 'Existing English overview', duration: '4 days' },
        es: { title: 'Titulo existente' },
        pt: { title: 'Titulo existente PT' },
        it: { title: 'Titolo esistente' },
      },
    }, false);

    expect(payload.titleJsonb).toEqual({
      ar: 'Arabic title',
      en: 'Existing English',
      es: 'Titulo existente',
      pt: 'Titulo existente PT',
      it: 'Titolo esistente',
    });
    expect(payload.durationJsonb).toMatchObject({ en: '4 days' });
    expect(payload.country).toBe('United Arab Emirates');
    expect(payload).not.toHaveProperty('status');
  });

  it('rejects a missing price instead of inserting a placeholder value', () => {
    expect(() => buildTripEditorPayload({ slug: 'new-tour', title: 'Title', destination: 'egypt' }, true))
      .toThrow('A real base price is required');
  });

  it('omits blank itinerary rows and keeps a draft save non-destructive', () => {
    const payload = buildTripEditorPayload({
      slug: 'new-tour',
      title: 'Title',
      destination: 'egypt',
      price: 900,
      itinerary: [{ day: 1, title: '', description: '', meals: '' }],
    }, true);

    expect(payload).toMatchObject({ status: 'DRAFT', isActive: false, city: null, basePriceUsd: 900, images: [] });
    expect(payload.itineraries).toEqual([]);
  });

  it('correctly serializes accommodation breakdown, market, and category tags', () => {
    const payload = buildTripEditorPayload({
      slug: 'nile-luxury-experience',
      title: 'Nile Luxury',
      destination: 'egypt',
      price: 2500,
      market: 'España',
      popular: true,
      luxury: true,
      hotelCategory: '5 Stars Deluxe',
      accommodation: [
        { destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' },
        { destination: 'Luxor', nights: 4, regime: 'Full Board' },
      ],
    }, false);

    expect(payload.market).toBe('España');
    expect(payload.city).toBe('Cairo');
    expect(payload.tags).toEqual(expect.arrayContaining(['popular', 'luxury']));
    expect(payload.hotelInfoJsonb).toEqual({
      hotelCategory: '5 Stars Deluxe',
      notes: '',
      accommodation: [
        { destination: 'Cairo', nights: 3, regime: 'Bed & Breakfast' },
        { destination: 'Luxor', nights: 4, regime: 'Full Board' },
      ],
    });
  });

  it('sends an empty tag array so removed tags are persisted', () => {
    const payload = buildTripEditorPayload({
      slug: 'tagless-tour', title: 'Tagless', destination: 'egypt', price: 0,
    }, false);

    expect(payload.tags).toEqual([]);
  });
});
