export type HotelStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface HotelRoomRecord {
  id: string;
  slug: string;
  name: Record<string, string>;
  ratePerNight: number;
  currency: string;
  maxOccupancy: number;
  inventory: number;
  isActive: boolean;
}

export interface AdminHotel {
  id: string;
  slug: string;
  nameJsonb: Record<string, string>;
  descriptionJsonb: Record<string, string> | null;
  destinationSlug: string;
  city: string;
  stars: number;
  rating: number | null;
  currency: string;
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
  destinationSlug: string;
  city: string;
  stars: number;
  rating?: number;
  currency: string;
  heroMediaId?: string;
  status: HotelStatus;
  isActive: boolean;
}

