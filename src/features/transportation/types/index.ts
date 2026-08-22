export interface TransportVehicle {
  id: string;
  name: string;
  category: "bus" | "van" | "luxury_sedan" | "suv";
  seats: number;
  doors: number;
  rating: number;
  pricePerDay: number;
  image: string;
  features: string[];
  isActive?: boolean;
}
