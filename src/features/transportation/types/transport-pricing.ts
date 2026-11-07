export interface TransportRouteI18n {
  ar?: string;
  en?: string;
  es?: string;
  pt?: string;
  it?: string;
  [key: string]: string | undefined;
}

export interface TransportPricing {
  id: string;
  tourId?: string;
  bookingId?: string;
  route: TransportRouteI18n | string;
  routes?: TransportRouteI18n;
  category?: string;
  passengerRange?: string;
  priceUsd?: number;
  priceBase0204: number;
  priceBase0507: number;
  priceBase0814: number;
  currency: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransportPricingDto {
  tourId?: string;
  bookingId?: string;
  route: TransportRouteI18n | string;
  priceBase0204: number;
  priceBase0507: number;
  priceBase0814: number;
  currency?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateTransportPricingDto {
  route?: TransportRouteI18n | string;
  priceBase0204?: number;
  priceBase0507?: number;
  priceBase0814?: number;
  currency?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TransportPricingFilters {
  tourId?: string;
  bookingId?: string;
  lang?: string;
}
