export type LanguageCode = 'ar' | 'en' | 'es' | 'pt' | 'it';

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
}

export interface AccommodationItem {
  destination: string;
  nights: number;
  regime: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  meals: string;
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
  images: string[];
  hotels?: string;

  // Accommodation Breakdown
  accommodation: AccommodationItem[];

  // Day-by-Day Itinerary
  itinerary: ItineraryItem[];

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
