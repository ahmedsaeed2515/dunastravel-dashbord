 
export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TourItinerary {
  id?: string;
  dayLabel?: string;
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

export interface Tour {
  id: string;
  slug: string;
  titleJsonb: Record<string, any>;
  subtitleJsonb?: Record<string, any> | null;
  overviewJsonb?: Record<string, any> | null;
  durationJsonb?: Record<string, any> | null;
  descriptionJsonb: Record<string, any>;
  highlightJsonb?: Record<string, any> | null;
  inclusionJsonb?: Record<string, any> | null;
  exclusionJsonb?: Record<string, any> | null;
  importantNotesJsonb?: Record<string, any> | null;
  cancellationPolicyJsonb?: Record<string, any> | null;
  category?: string | null;
  basePriceUsd: string;
  currency: string;
  isActive: boolean;
  status: TourStatus;
  isFeatured: boolean;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operatingDaysJsonb?: Record<string, any> | null;
  seasonPricingJsonb?: Record<string, any> | null;
  minParticipants: number;
  maxParticipants?: number | null;
  capacity: number;
  remainingSeats: number;
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
  landingPages?: any[];
  bookingCount?: number;
  reviewCount?: number;
  heroImage?: string | null;
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
  overviewJsonb?: Record<string, any> | null;
  durationJsonb?: Record<string, any> | null;
  descriptionJsonb?: Record<string, any>;
  highlightJsonb?: Record<string, any> | null;
  inclusionJsonb?: Record<string, any> | null;
  exclusionJsonb?: Record<string, any> | null;
  importantNotesJsonb?: Record<string, any> | null;
  cancellationPolicyJsonb?: Record<string, any> | null;
  category?: string | null;
  basePriceUsd: number;
  currency?: string;
  isActive?: boolean;
  status?: TourStatus;
  isFeatured?: boolean;
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

export type UpdateTourPayload = Partial<CreateTourPayload>;

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
