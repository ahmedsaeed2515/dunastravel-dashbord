import { apiClient } from "@/lib/axios";
import { TransportVehicle } from "../types";
import { requireObject } from "@/lib/api-response";

const CMS_BLOCK_KEY = "transportation_fleet";

function readCatalog(response: unknown): TransportVehicle[] {
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
        ? (value.data as { content: TransportVehicle[] }).content
        : null;
  if (!content) throw new Error("Invalid fleet catalog response");
  return content as TransportVehicle[];
}
export const transportationApi = {
  getFleet: async (): Promise<TransportVehicle[]> =>
    readCatalog(await apiClient.get(`/admin/cms-blocks/${CMS_BLOCK_KEY}`)),

  createVehicle: async (
    vehicle: Partial<TransportVehicle>,
  ): Promise<TransportVehicle> => {
    if (
      !vehicle.name?.trim() ||
      !vehicle.category ||
      vehicle.seats == null ||
      vehicle.doors == null ||
      vehicle.rating == null ||
      vehicle.pricePerDay == null
    ) {
      throw new Error(
        "Vehicle name, category, capacity, rating and price are required",
      );
    }
    const item = {
      name: vehicle.name.trim(),
      category: vehicle.category,
      seats: vehicle.seats,
      doors: vehicle.doors,
      rating: vehicle.rating,
      pricePerDay: vehicle.pricePerDay,
      image: vehicle.image?.trim() ?? "",
      features: vehicle.features ?? [],
      isActive: vehicle.isActive ?? true,
    };
    const response = await apiClient.post(
      `/admin/cms-blocks/${CMS_BLOCK_KEY}/items`,
      { item },
    );
    return requireObject<TransportVehicle>(response, "created vehicle");
  },

  updateVehicle: async (
    id: string,
    vehicle: Partial<TransportVehicle>,
  ): Promise<TransportVehicle> => {
    const response = await apiClient.patch(
      `/admin/cms-blocks/${CMS_BLOCK_KEY}/items/${id}`,
      { item: vehicle },
    );
    return requireObject<TransportVehicle>(response, "updated vehicle");
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/cms-blocks/${CMS_BLOCK_KEY}/items/${id}`);
  },
};
