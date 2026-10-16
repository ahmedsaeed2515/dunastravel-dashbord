export type LanguageCode = 'ar' | 'en' | 'es' | 'pt' | 'it';

export interface RouteMapLocation {
  id?: string;
  dbKey: string;
  lat: number;
  lng: number;
  daysVisited: number[];
  name: string;
  description: string;
}

export interface RouteMapData {
  title?: string;
  subtitle?: string;
  locations: RouteMapLocation[];
}

export interface TranslationDict {
  title?: string;
  subtitle?: string;
  overview?: string;
  duration?: string;
  departures?: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  itinerary?: {
    day: number;
    title: string;
    description: string;
    meals: string;
  }[];
  routeMap?: {
    title?: string;
    subtitle?: string;
    locations?: {
      dbKey?: string;
      lat?: number;
      lng?: number;
      daysVisited?: number[];
      name?: string;
      description?: string;
    }[];
  };
}

export interface AccommodationItem {
  id?: string;
  hotelId?: string;
  roomId?: string | null;
  destination: string;
  nights: number;
  categoryTier?: string;
  /** Localized hotel name (5 locales). */
  nameJsonb?: Partial<Record<LanguageCode, string>>;
  /** Localized city name (5 locales). */
  cityJsonb?: Partial<Record<LanguageCode, string>>;
  /** Double room price in USD (hotel rate sheet column 3). */
  doubleRoomPriceUsd?: number;
  /** Single room price in USD (hotel rate sheet column 4). */
  singleRoomPriceUsd?: number;
  /** Seasonal fee / surcharge in USD (hotel rate sheet column 5). */
  seasonSupplementUsd?: number;
  /** Localized boat / cruise name (hotel rate sheet column 6). */
  boatJsonb?: Partial<Record<LanguageCode, string>>;
  /** Extra boat / cruise price in USD (hotel rate sheet column 6). */
  boatPriceUsd?: number;
  /** @deprecated legacy price supplement, maps to seasonSupplementUsd. */
  priceSupplementUsd?: number;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface SeasonPricingRuleItem {
  seasonId?: string;
  seasonCode: string;
  seasonName?: string;
  label?: string;
  startDate: string;
  endDate: string;
  multiplier?: number;
  priceUsd?: number;
  supplementUsd?: number;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  meals: string;
}

/** A single inclusive date range during which bookings are blocked. */
export interface BookingBlockedRange {
  start: string; // YYYY-MM-DD (inclusive)
  end: string; // YYYY-MM-DD (inclusive)
  reason?: string;
}

/**
 * Recurring rules that stop bookings for a tour.
 * All fields are optional; `enabled` toggles the whole ruleset.
 */
export interface BookingRulesModel {
  enabled: boolean;
  /** Daily cutoff time in 24h "HH:mm" format — same-day departures are blocked after this time. */
  dailyCutoffTime?: string;
  /** IANA timezone used to evaluate the cutoff/blocked days. Defaults to Africa/Cairo on the server. */
  cutoffTimezone?: string;
  /** Days of the week with no departures. 0 = Sunday … 6 = Saturday. */
  blockedWeekdays?: number[];
  /** Explicit inclusive date ranges that are fully blocked. */
  blockedRanges?: BookingBlockedRange[];
}

export interface TripModel {
  // Identifiers & Basic Specs
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  destination: string; // egypt, turkey, jordan, morocco, greece, dubai, tunisia, holyland
  market: string; // Global, Brasil, España, Portugal, Italy, Middle East
  language: string; // en, ar, es, pt, it
  type?: string; // Classic, Honeymoon, VIP, Nile Cruise, Desert
  duration: string;
  departures: string;
  price: number;
  hotelCategory: string;
  rating: number;
  reviewCount: number;
  popular: boolean; // 🔥 tag
  views?: number;
  inquiries?: number;
  packageId?: string;

  // Category Tags
  familyFriendly: boolean; // 👨‍👩‍👧‍👦
  honeymoon: boolean; // 💍
  luxury: boolean; // ⭐ VIP
  cultural: boolean; // 🏛️
  adventure: boolean; // 🐪

  // Detailed Content & Media
  overview: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  heroImage?: string;
  images: string[];
  hotels?: string;

  // Price Display Configuration (dashboard-controlled)
  /** PRICE = show numeric price, HIDDEN = hide price, CUSTOM_LABEL = show custom localized text. */
  priceDisplayMode?: 'PRICE' | 'HIDDEN' | 'CUSTOM_LABEL';
  /** Localized custom price label used when priceDisplayMode === 'CUSTOM_LABEL'. */
  priceLabel?: Partial<Record<LanguageCode, string>>;

  // Recurring Booking Rules (dashboard-controlled)
  bookingRules?: BookingRulesModel;

  // Accommodation Breakdown & Relational Hotel/Room Assignments
  accommodation: AccommodationItem[];

  // Seasonal Pricing Rules
  seasonPricing?: SeasonPricingRuleItem[];

  // Day-by-Day Itinerary
  itinerary: ItineraryItem[];

  // Interactive Route Map
  routeMap?: RouteMapData;

  // 5-Language Translations Dictionary
  translations: {
    [key in LanguageCode]?: TranslationDict;
  };
}

export interface DestinationModel {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  gradient: string;
  description?: string;
  image?: string;
}

export interface EgyptPackageModel {
  id: string;
  titleAr: string;
  titleEn: string;
  type: string;
  icon: string;
  description: string;
  badge?: string;
}

export interface RoomType {
  id: string;
  name: string;
  price: number;
  mealPlan: string;
  maxOccupancy: number;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  childPolicy: string;
}

export interface HotelModel {
  id: string;
  name: string;
  destination: string;
  city: string;
  stars: number;
  rating: number;
  pricePerNight: number;
  status: 'ACTIVE' | 'VIP' | 'RECOMMENDED' | 'DRAFT';
  image: string;
  gallery: string[];
  description: string;
  address: string;
  mapUrl: string;
  phone: string;
  email: string;
  website: string;
  amenities: string[];
  roomTypes: RoomType[];
  policies: HotelPolicies;
  translations: {
    [key in LanguageCode]?: {
      name?: string;
      description?: string;
    };
  };
}
