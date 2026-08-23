import { apiClient } from "@/lib/axios";
import { HotelItem } from "../types";

function readCatalog(response: unknown): HotelItem[] {
  const value = response as { content?: unknown; data?: { content?: unknown } | unknown };
  const content = Array.isArray(value) ? value : Array.isArray(value?.content) ? value.content : value?.data && typeof value.data === "object" && Array.isArray((value.data as { content?: unknown }).content) ? (value.data as { content: HotelItem[] }).content : null;
  if (!content) throw new Error("Invalid hotels catalog response");
  return content as HotelItem[];
}
export const hotelsApi = {
  getHotels: async (): Promise<HotelItem[]> => readCatalog(await apiClient.get("/admin/cms-blocks/hotels_catalog")),

  createHotel: async (hotel: Partial<HotelItem>): Promise<HotelItem> => {
    if (!hotel.name?.trim() || !hotel.destination?.trim() || !hotel.city?.trim() || hotel.stars == null || hotel.rating == null || hotel.pricePerNight == null) {
      throw new Error("Hotel name, destination, city, stars, rating and price are required");
    }
    const current = await hotelsApi.getHotels();
    const saved: HotelItem = {
      id: crypto.randomUUID(),
      name: hotel.name.trim(),
      destination: hotel.destination.trim(),
      city: hotel.city.trim(),
      stars: hotel.stars,
      rating: hotel.rating,
      pricePerNight: hotel.pricePerNight,
      image: hotel.image?.trim() ?? "",
      description: hotel.description?.trim() ?? "",
      amenities: hotel.amenities ?? [],
      isActive: hotel.isActive ?? true,
    };
    await apiClient.put("/admin/cms-blocks/hotels_catalog", { content: [saved, ...current] });
    return saved;
  },

  updateHotel: async (id: string, hotel: Partial<HotelItem>): Promise<HotelItem> => {
    const current = await hotelsApi.getHotels();
    const existing = current.find((item) => item.id === id);
    if (!existing) throw new Error("Hotel not found");
    const saved = { ...existing, ...hotel, id };
    await apiClient.put("/admin/cms-blocks/hotels_catalog", { content: current.map((item) => item.id === id ? saved : item) });
    return saved;
  },

  deleteHotel: async (id: string): Promise<void> => {
    const current = await hotelsApi.getHotels();
    if (!current.some((item) => item.id === id)) throw new Error("Hotel not found");
    await apiClient.put("/admin/cms-blocks/hotels_catalog", { content: current.filter((item) => item.id !== id) });
  },
};
