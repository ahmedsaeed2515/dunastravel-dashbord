export type VehicleCategory = 'bus' | 'coaster' | 'private' | 'transfer' | 'luxury_van' | 'sedan' | 'suv' | string;

export interface LocalizedDictionary {
  ar?: string;
  en?: string;
  es?: string;
  pt?: string;
  it?: string;
  [key: string]: string | undefined;
}

export interface TransportationService {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  nameEs?: string;
  namePt?: string;
  nameIt?: string;
  nameJsonb?: LocalizedDictionary;
  serviceType: string;
  vehicleCategory?: VehicleCategory | null;
  vehicleType?: string | null;
  capacity?: number | null;
  doors?: number | null;
  transmission?: string | null;
  basePriceUsd: number | string;
  heroImageUrl?: string | null;
  heroMediaId?: string | null;
  heroImageAlt?: string | null;
  isPrivate?: boolean;
  isActive: boolean;
  isArchived?: boolean;
  rating?: number;
  reviews?: number;
  features?: string[];
  featuresJsonb?: any;
  description?: string | null;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionJsonb?: LocalizedDictionary;
  pickupInstructions?: string | null;
  dropoffInstructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceDraft = Omit<TransportationService, 'id'> & {
  id?: string;
  features: string[];
};


