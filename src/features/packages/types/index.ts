export interface TravelPackage {
  id: string;
  title: string;
  slug?: string;
  destination: string;
  duration: string;
  price: number;
  type?: string;
  popular?: boolean;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
