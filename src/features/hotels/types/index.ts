export interface HotelItem {
  id: string;
  name: string;
  destination: string;
  city: string;
  stars: number;
  rating: number;
  pricePerNight: number;
  image: string;
  description: string;
  amenities?: string[];
  isActive?: boolean;
}
