export type VehicleCategory = 'bus' | 'coaster' | 'private' | 'transfer' | string;

export interface TransportationService {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  serviceType: string;
  vehicleCategory?: VehicleCategory | null;
  vehicleType?: string | null;
  capacity?: number | null;
  doors?: number | null;
  transmission?: string | null;
  basePriceUsd: number | string;
  heroImageUrl?: string | null;
  heroMediaId?: string | null;
  isPrivate?: boolean;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  features?: string[];
  featuresJsonb?: string[] | null;
  description?: string | null;
  pickupInstructions?: string | null;
  dropoffInstructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceDraft = Omit<TransportationService, 'id'> & {
  id?: string;
  features: string[];
};

