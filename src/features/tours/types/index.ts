 
export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TourItinerary {
  id?: string;
  dayLabel?: string;
  titleJsonb?: Record<string, any> | null;
  descriptionJsonb: Record<string, any>;
  mealsJsonb?: Record<string, any> | null;
  activitiesJsonb?: Record<string, any> | null;
  hotelsJsonb?: Record<string, any> | null;
  transportationJsonb?: Record<string, any> | null;
  notesJsonb?: Record<string, any> | null;
  sortOrder: number;
}

export interface TourImage {
  id?: string;
  imageUrl: string;
  isHero?: boolean;
  isVideo?: boolean;
  videoUrl?: string | null;
  altText?: string | null;
  sortOrder: number;
}

export interface TourLandingPageRelation {
  id: string;
  slug: string;
  titleJsonb?: Record<string, unknown>;
  type: string;
  isVisible: boolean;
  status: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type TourAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'CLOSED';

/** A departure-level inventory record. Tour itself has no capacity columns. */
export interface TourAvailability {
  id: string;
  tourId: string;
  date: string;
  totalCapacity: number;
  remainingSeats: number;
  status: TourAvailabilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourAvailabilityPayload {
  date: string;
  totalCapacity: number;
  status?: TourAvailabilityStatus;
}

export interface UpdateTourAvailabilityPayload {
  totalCapacity?: number;
  remainingSeats?: number;
  status?: TourAvailabilityStatus;
  expectedUpdatedAt: string;
}

export interface Tour {
  id: string;
  slug: string;
  titleJsonb: Record<string, any>;
  subtitleJsonb?: Record<string, any> | null;
  highlightsJsonb?: Record<string, any> | null;
  departureInfoJsonb?: Record<string, any> | null;
  sourceCodeJsonb?: Record<string, any> | null;
  sourceCatalogId?: string | null;
  market?: string | null;
  sourceRating?: string | null;
  sourceReviewCount?: number | null;
  overviewJsonb?: Record<string, any> | null;
  durationJsonb?: Record<string, any> | null;
  descriptionJsonb?: Record<string, any> | null;
  highlightJsonb?: Record<string, any> | null;
  inclusionJsonb?: Record<string, any> | null;
  exclusionJsonb?: Record<string, any> | null;
  includedServicesJsonb?: Record<string, any> | null;
  excludedServicesJsonb?: Record<string, any> | null;
  hotelInfoJsonb?: Record<string, any> | null;
  transportationJsonb?: Record<string, any> | null;
  pickupLocationsJsonb?: Record<string, any> | null;
  importantNotesJsonb?: Record<string, any> | null;
  termsJsonb?: Record<string, any> | null;
  cancellationPolicyJsonb?: Record<string, any> | null;
  routeMapJsonb?: Record<string, any> | null;
  category?: string | null;
  basePriceUsd: string;
  currency: string;
  isActive: boolean;
  status: TourStatus;
  isFeatured: boolean;
  displayOrder?: number | null;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operatingDaysJsonb?: Record<string, any> | null;
  seasonPricingJsonb?: Record<string, any> | null;
  minParticipants?: number;
  maxParticipants?: number | null;
  capacity?: number;
  remainingSeats?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  itineraries?: TourItinerary[];
  images?: TourImage[];
  reviews?: any[];
  activityLogs?: any[];
  bookings?: any[];
  landingPages?: TourLandingPageRelation[];
  bookingCount?: number;
  reviewCount?: number;
  heroImage?: string | null;
}

/** The admin preview's intentionally narrow, public-facing presentation DTO. */
export interface TourPreview {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  basePriceUsd: string;
  currency: string;
  duration: string;
  overview: string;
  cancellationPolicy: string | null;
  includedServices: string[];
  excludedServices: string[];
  hotelInfo: string | null;
  seasonPricing: string | null;
  tags: string[];
  difficultyLevel: string | null;
  meetingPoint: string | null;
  country: string | null;
  languages: string[];
  isFeatured: boolean;
  displayOrder?: number | null;
  itinerary: Array<{
    id: string;
    dayLabel: string | null;
    description: string;
    meals: string | null;
    sortOrder: number;
  }>;
  images: Array<{
    id: string;
    imageUrl: string;
    isHero: boolean;
    altText: string | null;
    sortOrder: number;
  }>;
  preview: {
    status: TourStatus;
    isActive: boolean;
    isPublic: boolean;
  };
}

export type TourDetail = Tour;

export interface TourQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  destination?: string;
  city?: string;
  category?: string;
  market?: string;
  status?: string;
  isFeatured?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTourPayload {
  slug: string;
  titleJsonb: Record<string, any>;
  subtitleJsonb?: Record<string, any> | null;
  highlightsJsonb?: Record<string, any> | null;
  departureInfoJsonb?: Record<string, any> | null;
  sourceCodeJsonb?: Record<string, any> | null;
  market?: string | null;
  sourceRating?: number | null;
  sourceReviewCount?: number | null;
  overviewJsonb?: Record<string, any> | null;
  durationJsonb?: Record<string, any> | null;
  descriptionJsonb?: Record<string, any>;
  highlightJsonb?: Record<string, any> | null;
  inclusionJsonb?: Record<string, any> | null;
  exclusionJsonb?: Record<string, any> | null;
  includedServicesJsonb?: Record<string, any> | null;
  excludedServicesJsonb?: Record<string, any> | null;
  hotelInfoJsonb?: Record<string, any> | null;
  transportationJsonb?: Record<string, any> | null;
  pickupLocationsJsonb?: Record<string, any> | null;
  importantNotesJsonb?: Record<string, any> | null;
  termsJsonb?: Record<string, any> | null;
  cancellationPolicyJsonb?: Record<string, any> | null;
  routeMapJsonb?: Record<string, any> | null;
  category?: string | null;
  basePriceUsd: number;
  currency?: string;
  isActive?: boolean;
  status?: TourStatus;
  isFeatured?: boolean;
  displayOrder?: number;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operatingDaysJsonb?: Record<string, any> | null;
  seasonPricingJsonb?: Record<string, any> | null;
  minParticipants?: number;
  maxParticipants?: number | null;
  capacity?: number;
  remainingSeats?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
  itineraries?: TourItinerary[];
  images?: TourImage[];
}

export type UpdateTourPayload = Partial<CreateTourPayload> & {
  /** Optimistic-concurrency token from the most recent admin tour read. */
  expectedUpdatedAt?: string;
};

export interface BulkUpdateToursPayload {
  slugs: string[];
  status?: TourStatus;
  category?: string;
  country?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface TourStats {
  totalTours: number;
  publishedTours: number;
  draftTours: number;
  featuredTours: number;
  totalCapacity: number;
  totalRemainingSeats: number;
  seatsSold: number;
  occupancyRate: string;
}

export interface TourCatalogOverview {
  totalTours: number;
  visibleOnWebsite: number;
  hiddenFromWebsite: number;
  unpublished: number;
  unlinked: number;
  interfaces: Array<{
    slug: string;
    titleJsonb: Record<string, unknown>;
    isPublic: boolean;
    total: number;
    visible: number;
    hidden: number;
  }>;
  integrity: {
    complete: number;
    needsReview: number;
    issues: Array<{
      slug: string;
      missingLocales: string[];
      missingFields: string[];
    }>;
  };
}
