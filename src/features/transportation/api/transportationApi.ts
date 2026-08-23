import { apiClient } from "@/lib/axios";
import { TransportVehicle } from "../types";

const CMS_BLOCK_KEY = "transportation_fleet";

function readCatalog(response: unknown): TransportVehicle[] {
  const value = response as { content?: unknown; data?: { content?: unknown } | unknown };
  const content = Array.isArray(value) ? value : Array.isArray(value?.content) ? value.content : value?.data && typeof value.data === "object" && Array.isArray((value.data as { content?: unknown }).content) ? (value.data as { content: TransportVehicle[] }).content : null;
  if (!content) throw new Error("Invalid fleet catalog response");
  return content as TransportVehicle[];
}
export const transportationApi = {
  getFleet: async (): Promise<TransportVehicle[]> => readCatalog(await apiClient.get(`/admin/cms-blocks/${CMS_BLOCK_KEY}`)),

  createVehicle: async (vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    if (!vehicle.name?.trim() || !vehicle.category || vehicle.seats == null || vehicle.doors == null || vehicle.rating == null || vehicle.pricePerDay == null) {
      throw new Error("Vehicle name, category, capacity, rating and price are required");
    }
    const current = await transportationApi.getFleet();
    const saved: TransportVehicle = {
      id: crypto.randomUUID(),
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
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: [saved, ...current] });
    return saved;
  },

  updateVehicle: async (id: string, vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    const current = await transportationApi.getFleet();
    const existing = current.find((item) => item.id === id);
    if (!existing) throw new Error("Vehicle not found");
    const saved = { ...existing, ...vehicle, id };
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: current.map((item) => item.id === id ? saved : item) });
    return saved;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    const current = await transportationApi.getFleet();
    if (!current.some((item) => item.id === id)) throw new Error("Vehicle not found");
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: current.filter((item) => item.id !== id) });
  },
};
