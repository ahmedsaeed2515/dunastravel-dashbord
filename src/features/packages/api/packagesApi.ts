import { apiClient } from "@/lib/axios";
import { TravelPackage } from "../types";

const CMS_BLOCK_KEY = "holiday_packages";

function readCatalog(response: unknown): TravelPackage[] {
  const value = response as { content?: unknown; data?: { content?: unknown } | unknown };
  const content = Array.isArray(value) ? value : Array.isArray(value?.content) ? value.content : value?.data && typeof value.data === "object" && Array.isArray((value.data as { content?: unknown }).content) ? (value.data as { content: TravelPackage[] }).content : null;
  if (!content) throw new Error("Invalid packages catalog response");
  return content as TravelPackage[];
}
export const packagesApi = {
  getPackages: async (): Promise<TravelPackage[]> => readCatalog(await apiClient.get(`/admin/cms-blocks/${CMS_BLOCK_KEY}`)),

  createPackage: async (pkg: Partial<TravelPackage>): Promise<TravelPackage> => {
    if (!pkg.title?.trim() || !pkg.destination?.trim() || !pkg.duration?.trim() || pkg.price == null) {
      throw new Error("Package title, destination, duration and price are required");
    }
    const current = await packagesApi.getPackages();
    const now = new Date().toISOString();
    const saved: TravelPackage = {
      id: crypto.randomUUID(),
      title: pkg.title.trim(),
      slug: pkg.slug?.trim(),
      destination: pkg.destination.trim(),
      duration: pkg.duration.trim(),
      price: pkg.price,
      type: pkg.type?.trim(),
      popular: pkg.popular ?? false,
      description: pkg.description?.trim(),
      image: pkg.image?.trim(),
      createdAt: now,
      updatedAt: now,
    };
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: [saved, ...current] });
    return saved;
  },

  updatePackage: async (id: string, payload: Partial<TravelPackage>): Promise<TravelPackage> => {
    const current = await packagesApi.getPackages();
    const existing = current.find((item) => item.id === id);
    if (!existing) throw new Error("Package not found");
    const saved = { ...existing, ...payload, id, updatedAt: new Date().toISOString() };
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: current.map((item) => item.id === id ? saved : item) });
    return saved;
  },

  deletePackage: async (id: string): Promise<boolean> => {
    const current = await packagesApi.getPackages();
    if (!current.some((item) => item.id === id)) throw new Error("Package not found");
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, { content: current.filter((item) => item.id !== id) });
    return true;
  },
};
