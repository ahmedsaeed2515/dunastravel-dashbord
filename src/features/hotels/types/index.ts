export type HotelStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface HotelRoomRecord {
  id: string;
  slug: string;
  name: Record<string, string>;
  description?: Record<string, string> | null;
  ratePerNight: number;
  currency: string;
  mealPlan?: Record<string, string> | null;
  maxOccupancy: number;
  inventory: number;
  isActive: boolean;
}

export interface HotelRoomPayload {
  slug: string;
  nameJsonb: Record<string, string>;
  descriptionJsonb?: Record<string, string>;
  ratePerNight: number;
  currency?: string;
  mealPlanJsonb?: Record<string, string>;
  maxOccupancy: number;
  inventory: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface AdminHotel {
  id: string;
  slug: string;
  nameJsonb: Record<string, string>;
  descriptionJsonb: Record<string, string> | null;
  addressJsonb?: Record<string, string> | null;
  destinationSlug: string;
  city: string;
  stars: number;
  rating: number | null;
  currency: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  amenitiesJsonb?: Record<string, any> | null;
  policiesJsonb?: Record<string, any> | null;
  heroMediaId: string | null;
  heroImageUrl: string | null;
  status: HotelStatus;
  isActive: boolean;
  sortOrder: number;
  rooms: HotelRoomRecord[];
}

export interface HotelsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: HotelStatus;
  destinationSlug?: string;
}

export interface PaginatedHotels {
  data: AdminHotel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface HotelPayload {
  slug: string;
  nameJsonb: Record<string, string>;
  descriptionJsonb?: Record<string, string>;
  addressJsonb?: Record<string, string>;
  destinationSlug: string;
  city: string;
  stars: number;
  rating?: number;
  currency: string;
  phone?: string;
  email?: string;
  website?: string;
  amenitiesJsonb?: Record<string, any>;
  policiesJsonb?: Record<string, any>;
  heroMediaId?: string;
  heroImageUrl?: string;
  images?: Array<{ id?: string; url: string; altText?: string; isHero?: boolean; sortOrder?: number }>;
  status: HotelStatus;
  isActive: boolean;
  rooms?: HotelRoomPayload[];
}


