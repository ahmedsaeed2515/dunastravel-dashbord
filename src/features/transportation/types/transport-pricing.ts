export interface TransportPricing {
  id: string;
  tourId?: string;
  bookingId?: string;
  category: string;
  passengerRange: string; // e.g., "2-4", "5-7", "8-14"
  priceUsd: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransportPricingDto {
  tourId?: string;
  bookingId?: string;
  category: string;
  passengerRange: string;
  priceUsd: number;
  currency?: string;
}

export interface UpdateTransportPricingDto {
  priceUsd?: number;
  isActive?: boolean;
}

export interface TransportPricingFilters {
  tourId?: string;
  bookingId?: string;
  category?: string;
  passengerRange?: string;
}