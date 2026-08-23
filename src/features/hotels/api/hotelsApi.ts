import { apiClient } from "@/lib/axios";
import { HotelItem } from "../types";
import { requireObject } from "@/lib/api-response";

function readCatalog(response: unknown): HotelItem[] {
  const value = response as {
    content?: unknown;
    data?: { content?: unknown } | unknown;
  };
  const content = Array.isArray(value)
    ? value
    : Array.isArray(value?.content)
      ? value.content
      : value?.data &&
          typeof value.data === "object" &&
          Array.isArray((value.data as { content?: unknown }).content)
        ? (value.data as { content: HotelItem[] }).content
        : null;
  if (!content) throw new Error("Invalid hotels catalog response");
  return content as HotelItem[];
}
export const hotelsApi = {
  getHotels: async (): Promise<HotelItem[]> =>
    readCatalog(await apiClient.get("/admin/cms-blocks/hotels_catalog")),

  createHotel: async (hotel: Partial<HotelItem>): Promise<HotelItem> => {
    if (
      !hotel.name?.trim() ||
      !hotel.destination?.trim() ||
      !hotel.city?.trim() ||
      hotel.stars == null ||
      hotel.rating == null ||
      hotel.pricePerNight == null
    ) {
      throw new Error(
        "Hotel name, destination, city, stars, rating and price are required",
      );
    }
    const item = {
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
    const response = await apiClient.post(
      "/admin/cms-blocks/hotels_catalog/items",
      { item },
    );
    return requireObject<HotelItem>(response, "created hotel");
  },

  updateHotel: async (
    id: string,
    hotel: Partial<HotelItem>,
  ): Promise<HotelItem> => {
    const response = await apiClient.patch(
      `/admin/cms-blocks/hotels_catalog/items/${id}`,
      { item: hotel },
    );
    return requireObject<HotelItem>(response, "updated hotel");
  },

  deleteHotel: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/cms-blocks/hotels_catalog/items/${id}`);
  },
};
