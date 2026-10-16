import { describe, expect, it } from 'vitest';
import { buildTripEditorPayload, tourToTripModel } from './tripEditorPayload';

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
        { destination: 'Cairo', nights: 3 },
        { destination: 'Luxor', nights: 4 },
      ],
    }, false);

    expect(payload.market).toBe('España');
    expect(payload.city).toBe('Cairo');
    expect(payload.tags).toEqual(expect.arrayContaining(['popular', 'luxury']));
    expect(payload.hotelInfoJsonb).toEqual({
      hotelCategory: '5 Stars Deluxe',
      notes: '',
      accommodation: [
        { destination: 'Cairo', nights: 3 },
        { destination: 'Luxor', nights: 4 },
      ],
    });
  });

  it('sends an empty tag array so removed tags are persisted', () => {
    const payload = buildTripEditorPayload({
      slug: 'tagless-tour', title: 'Tagless', destination: 'egypt', price: 0,
    }, false);

    expect(payload.tags).toEqual([]);
  });

  it('correctly sets selected heroImage as isHero: true and positions it first', () => {
    const payload = buildTripEditorPayload({
      slug: 'pyramids-tour',
      title: 'Pyramids Tour',
      destination: 'egypt',
      price: 100,
      images: [
        'https://example.com/img1.jpg',
        'https://example.com/img2-hero.jpg',
        'https://example.com/img3.jpg',
      ],
      heroImage: 'https://example.com/img2-hero.jpg',
    }, false);

    expect(payload.images).toHaveLength(3);
    expect(payload.images![0]).toEqual({
      imageUrl: 'https://example.com/img2-hero.jpg',
      isHero: true,
      sortOrder: 0,
    });
    expect(payload.images![1].imageUrl).toBe('https://example.com/img1.jpg');
    expect(payload.images![1].isHero).toBe(false);
    expect(payload.images![2].imageUrl).toBe('https://example.com/img3.jpg');
    expect(payload.images![2].isHero).toBe(false);
  });

  it('serializes relational accommodations and seasonal pricing rules', () => {
    const payload = buildTripEditorPayload({
      slug: 'royal-egypt-tour',
      title: 'Royal Egypt',
      destination: 'egypt',
      price: 1800,
      accommodation: [
        {
          hotelId: '11111111-1111-4111-8111-111111111111',
          roomId: '22222222-2222-4222-8222-222222222222',
          destination: 'Giza',
          nights: 3,
          categoryTier: '5★ Luxury',
          priceSupplementUsd: 150,
          isDefault: true,
        },
      ],
      seasonPricing: [
        {
          seasonCode: 'HIGH',
          seasonName: 'High Season',
          startDate: '2026-10-01',
          endDate: '2027-04-30',
          priceUsd: 2100,
        },
      ],
    }, false);

    expect(payload.accommodations).toHaveLength(1);
    expect(payload.accommodations![0]).toMatchObject({
      hotelId: '11111111-1111-4111-8111-111111111111',
      roomId: '22222222-2222-4222-8222-222222222222',
      destination: 'Giza',
      nights: 3,
      priceSupplementUsd: 150,
    });
    expect(payload.seasonPricingJsonb).toEqual({
      rules: [
        {
          seasonCode: 'HIGH',
          seasonName: 'High Season',
          startDate: '2026-10-01',
          endDate: '2027-04-30',
          priceUsd: 2100,
        },
      ],
    });
  });

  it('always emits empty accommodations and seasonPricingJsonb.rules arrays when cleared (BUG-02)', () => {
    const payload = buildTripEditorPayload({
      slug: 'cleared-tour',
      title: 'Cleared Tour',
      destination: 'egypt',
      price: 1200,
      accommodation: [],
      seasonPricing: [],
    }, false);

    expect(payload.accommodations).toEqual([]);
    expect(payload.seasonPricingJsonb).toEqual({ rules: [] });
  });

  it('preserves accommodations, seasonPricing, 5-locale itinerary titleJsonb, hotelCategory, and tags across a full tourToTripModel -> buildTripEditorPayload round trip (BUG-10)', () => {
    const dbTour: any = {
      id: 'tour-uuid-1',
      slug: 'grand-nile-odyssey',
      titleJsonb: { ar: 'أوديسا النيل', en: 'Grand Nile Odyssey', es: 'Odisea del Nilo', pt: 'Odisseia do Nilo', it: 'Odissea sul Nilo' },
      subtitleJsonb: { ar: 'رحلة ملكية', en: 'Royal Journey', es: 'Viaje Real', pt: 'Jornada Real', it: 'Viaggio Reale' },
      overviewJsonb: { ar: 'نظرة عامة', en: 'Overview EN', es: 'Resumen ES', pt: 'Resumo PT', it: 'Panoramica IT' },
      durationJsonb: { ar: '8 أيام', en: '8 Days', es: '8 Días', pt: '8 Dias', it: '8 Giorni' },
      departureInfoJsonb: { ar: 'يومياً', en: 'Daily', es: 'Diario', pt: 'Diário', it: 'Giornaliero' },
      category: 'Luxury',
      country: 'Egypt',
      city: 'Cairo',
      market: 'Global',
      basePriceUsd: '2400',
      currency: 'USD',
      isActive: true,
      status: 'PUBLISHED',
      isFeatured: true,
      tags: ['popular', 'luxury', 'honeymoon'],
      hotelInfoJsonb: {
        hotelCategory: '5-Star Ultra Luxury',
        notes: 'Guaranteed Nile view suites',
      },
      accommodations: [
        {
          id: 'acc-1',
          hotelId: '11111111-1111-4111-8111-111111111111',
          roomId: '22222222-2222-4222-8222-222222222222',
          destination: 'Cairo',
          nights: 3,
          categoryTier: '5_STAR',
          priceSupplementUsd: 180,
          isDefault: true,
          sortOrder: 0,
        },
      ],
      seasonPricingJsonb: {
        rules: [
          {
            seasonCode: 'WINTER_PEAK',
            label: 'Winter Peak',
            startDate: '2026-12-01',
            endDate: '2027-02-28',
            multiplier: 1.25,
            priceUsd: 3000,
          },
        ],
      },
      itineraries: [
        {
          dayLabel: 'الوصول إلى القاهرة',
          titleJsonb: {
            ar: 'الوصول إلى القاهرة',
            en: 'Arrival in Cairo',
            es: 'Llegada a El Cairo',
            pt: 'Chegada ao Cairo',
            it: 'Arrivo al Cairo',
          },
          descriptionJsonb: {
            ar: 'استقبال VIP',
            en: 'VIP Meet & Assist',
            es: 'Recepción VIP',
            pt: 'Recepção VIP',
            it: 'Accoglienza VIP',
          },
          mealsJsonb: {
            ar: 'العشاء',
            en: 'Dinner',
            es: 'Cena',
            pt: 'Jantar',
            it: 'Cena',
          },
          sortOrder: 0,
        },
      ],
      images: [
        { imageUrl: 'https://example.com/hero.jpg', isHero: true, sortOrder: 0 },
        { imageUrl: 'https://example.com/gallery-1.jpg', isHero: false, sortOrder: 1 },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // Hydrate into TripModel and edit only 1 field (base price)
    const tripModel = tourToTripModel(dbTour);
    tripModel.price = 2550;

    const payload = buildTripEditorPayload(tripModel, false);

    expect(payload.basePriceUsd).toBe(2550);
    expect(payload.tags).toEqual(['popular', 'luxury', 'honeymoon']);
    expect(payload.hotelInfoJsonb).toMatchObject({
      hotelCategory: '5-Star Ultra Luxury',
      notes: 'Guaranteed Nile view suites',
    });
    expect(payload.accommodations).toEqual([
      {
        hotelId: '11111111-1111-4111-8111-111111111111',
        roomId: '22222222-2222-4222-8222-222222222222',
        destination: 'Cairo',
        nights: 3,
        categoryTier: '5_STAR',
        priceSupplementUsd: 180,
        isDefault: true,
        sortOrder: 0,
      },
    ]);
    expect(payload.seasonPricingJsonb?.rules[0]).toMatchObject({
      seasonCode: 'WINTER_PEAK',
      seasonName: 'Winter Peak',
      label: 'Winter Peak',
      startDate: '2026-12-01',
      endDate: '2027-02-28',
      multiplier: 1.25,
      priceUsd: 3000,
    });
    expect(payload.itineraries![0].titleJsonb).toEqual({
      ar: 'الوصول إلى القاهرة',
      en: 'Arrival in Cairo',
      es: 'Llegada a El Cairo',
      pt: 'Chegada ao Cairo',
      it: 'Arrivo al Cairo',
    });
  });

  it('serializes the 6-column hotel rate sheet (category, names, double/single rates, season fee, boats)', () => {
    const payload = buildTripEditorPayload({
      slug: 'rate-sheet-tour',
      title: 'Rate Sheet',
      destination: 'egypt',
      price: 1500,
      hotelCategory: '5 Stars Deluxe',
      accommodation: [
        {
          destination: 'Cairo',
          nights: 3,
          categoryTier: '5_STAR',
          nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
          cityJsonb: { ar: 'القاهرة', en: 'Cairo' },
          doubleRoomPriceUsd: 220,
          singleRoomPriceUsd: 160,
          seasonSupplementUsd: 45,
          boatJsonb: { ar: 'مركب نيلي', en: 'Nile Cruise Boat' },
          boatPriceUsd: 75,
        },
      ],
    }, false);

    expect(payload.hotelInfoJsonb).toMatchObject({
      hotelCategory: '5 Stars Deluxe',
      accommodation: [
        {
          destination: 'Cairo',
          nights: 3,
          categoryTier: '5_STAR',
          nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
          cityJsonb: { ar: 'القاهرة', en: 'Cairo' },
          doubleRoomPriceUsd: 220,
          singleRoomPriceUsd: 160,
          seasonSupplementUsd: 45,
          boatJsonb: { ar: 'مركب نيلي', en: 'Nile Cruise Boat' },
          boatPriceUsd: 75,
        },
      ],
    });
  });

  it('round-trips the 6-column rate sheet through tourToTripModel -> buildTripEditorPayload', () => {
    const dbTour: any = {
      id: 'tour-uuid-2',
      slug: 'rate-sheet-roundtrip',
      titleJsonb: { ar: 'Rate Sheet', en: 'Rate Sheet' },
      city: 'Cairo',
      basePriceUsd: '1500',
      currency: 'USD',
      hotelInfoJsonb: {
        hotelCategory: '5 Stars Deluxe',
        accommodation: [
          {
            destination: 'Cairo',
            nights: 3,
            categoryTier: '5_STAR',
            nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
            cityJsonb: { ar: 'القاهرة', en: 'Cairo' },
            doubleRoomPriceUsd: 220,
            singleRoomPriceUsd: 160,
            seasonSupplementUsd: 45,
            boatJsonb: { ar: 'مركب نيلي', en: 'Nile Cruise Boat' },
            boatPriceUsd: 75,
          },
        ],
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const model = tourToTripModel(dbTour);
    expect(model.accommodation[0]).toMatchObject({
      destination: 'Cairo',
      categoryTier: '5_STAR',
      nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
      cityJsonb: { ar: 'القاهرة', en: 'Cairo' },
      doubleRoomPriceUsd: 220,
      singleRoomPriceUsd: 160,
      seasonSupplementUsd: 45,
      boatJsonb: { ar: 'مركب نيلي', en: 'Nile Cruise Boat' },
      boatPriceUsd: 75,
    });

    const payload = buildTripEditorPayload(model, false);
    expect(payload.hotelInfoJsonb).toMatchObject({
      accommodation: [
        {
          nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
          cityJsonb: { ar: 'القاهرة', en: 'Cairo' },
          doubleRoomPriceUsd: 220,
          singleRoomPriceUsd: 160,
          seasonSupplementUsd: 45,
          boatJsonb: { ar: 'مركب نيلي', en: 'Nile Cruise Boat' },
          boatPriceUsd: 75,
        },
      ],
    });
  });

  it('resolves the hotel name for catalog-linked relational accommodations from the nested hotel (BUG: hotel missing in dashboard)', () => {
    const dbTour: any = {
      id: 'tour-uuid-3',
      slug: 'catalog-hotel-tour',
      titleJsonb: { ar: 'رحلة بفندق من الدليل', en: 'Catalog Hotel Tour' },
      city: 'Cairo',
      basePriceUsd: '1200',
      currency: 'USD',
      // The JSONB summary written by the backend carries the name under `hotelNameJsonb`.
      hotelInfoJsonb: {
        hotels: { Cairo: ['Nile Palace'] },
        accommodations: [
          {
            hotelId: '11111111-1111-4111-8111-111111111111',
            hotelSlug: 'nile-palace',
            hotelNameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
            roomId: '22222222-2222-4222-8222-222222222222',
            destination: 'Cairo',
            city: 'Cairo',
            nights: 3,
            isDefault: true,
            sortOrder: 0,
          },
        ],
      },
      // The admin API returns relational rows with a nested hotel/room and no top-level name.
      accommodations: [
        {
          id: 'acc-1',
          hotelId: '11111111-1111-4111-8111-111111111111',
          roomId: '22222222-2222-4222-8222-222222222222',
          destination: 'Cairo',
          nights: 3,
          hotel: {
            id: '11111111-1111-4111-8111-111111111111',
            slug: 'nile-palace',
            nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
            city: 'Cairo',
            stars: 5,
          },
          room: {
            id: '22222222-2222-4222-8222-222222222222',
            slug: 'deluxe-double',
            nameJsonb: { ar: 'غرفة ديلوكس', en: 'Deluxe Double' },
            ratePerNight: '180.00',
          },
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const model = tourToTripModel(dbTour);

    expect(model.accommodation).toHaveLength(1);
    expect(model.accommodation[0]).toMatchObject({
      hotelId: '11111111-1111-4111-8111-111111111111',
      roomId: '22222222-2222-4222-8222-222222222222',
      nameJsonb: { ar: 'فندق النيل', en: 'Nile Palace' },
      destination: 'Cairo',
      nights: 3,
    });
  });

  it('falls back to the singular hotelInfoJsonb.accommodation when the plural summary is empty (manual trip hotel)', () => {
    const dbTour: any = {
      id: 'tour-uuid-4',
      slug: 'manual-hotel-tour',
      titleJsonb: { ar: 'رحلة بفندق يدوي', en: 'Manual Hotel Tour' },
      city: 'Luxor',
      basePriceUsd: '900',
      currency: 'USD',
      // The backend sync writes an empty plural summary when no catalog hotel is linked.
      hotelInfoJsonb: {
        hotels: {},
        accommodations: [],
        accommodation: [
          {
            destination: 'Luxor',
            nights: 2,
            nameJsonb: { ar: 'فندق الكرنك', en: 'Karnak Hotel' },
            doubleRoomPriceUsd: 140,
          },
        ],
      },
      accommodations: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const model = tourToTripModel(dbTour);

    expect(model.accommodation).toHaveLength(1);
    expect(model.accommodation[0]).toMatchObject({
      destination: 'Luxor',
      nights: 2,
      nameJsonb: { ar: 'فندق الكرنك', en: 'Karnak Hotel' },
      doubleRoomPriceUsd: 140,
    });
  });

  it('keeps several hotel names (one per line) for the same city and drops blank lines', () => {
    const payload = buildTripEditorPayload({
      slug: 'multi-hotel-city',
      title: 'Multi Hotel City',
      destination: 'egypt',
      price: 1500,
      accommodation: [
        {
          destination: 'Giza',
          nights: 1,
          categoryTier: '5_STAR',
          nameJsonb: {
            ar: 'فندق الأهرام\nفندق النيل\n\nفندق المينا',
            en: 'Pyramids Hotel\nNile Hotel\n\nMena House',
          },
          cityJsonb: { ar: 'الجيزة', en: 'Giza' },
        },
      ],
    }, false);

    const row = (payload.hotelInfoJsonb as any).accommodation[0];
    expect(row.nameJsonb.ar).toBe('فندق الأهرام\nفندق النيل\nفندق المينا');
    expect(row.nameJsonb.en).toBe('Pyramids Hotel\nNile Hotel\nMena House');
    expect(row.cityJsonb).toEqual({ ar: 'الجيزة', en: 'Giza' });
  });
});


