export type VehicleCategory = 'bus' | 'coaster' | 'private';

export interface TransportationService {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  serviceType: string;
  vehicleCategory: VehicleCategory | string;
  vehicleType: string;
  capacity: number;
  doors: number;
  transmission: string;
  basePriceUsd: number;
  heroImageUrl: string;
  heroMediaId?: string | null;
  isPrivate: boolean;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  features: string[];
  description?: string | null;
  pickupInstructions?: string | null;
  dropoffInstructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceDraft = Omit<TransportationService, 'id'> & {
  id?: string;
};
