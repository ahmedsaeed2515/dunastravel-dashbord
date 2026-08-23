import { apiClient } from "@/lib/axios";
import { TravelPackage } from "../types";

const CMS_BLOCK_KEY = "holiday_packages";

export const packagesApi = {
  getPackages: async (): Promise<TravelPackage[]> => {
    try {
      const res: any = await apiClient.get(`/admin/cms-blocks/${CMS_BLOCK_KEY}`);
      if (res?.content && Array.isArray(res.content)) return res.content;
      if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
    } catch {
      // Return empty array on error
    }
    return [];
  },

  createPackage: async (pkg: Partial<TravelPackage>): Promise<TravelPackage> => {
    const current = await packagesApi.getPackages();
    const newPkg: TravelPackage = {
      id: pkg.id || `pkg-${Date.now()}`,
      title: pkg.title || "New Package",
      destination: pkg.destination || "Egypt",
      duration: pkg.duration || "5 Days",
      price: pkg.price || 999,
      type: pkg.type || "Classic",
      popular: pkg.popular || false,
      description: pkg.description || "",
      image: pkg.image || "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPkg, ...current];
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, {
      content: updated,
    });
    return newPkg;
  },

  updatePackage: async (id: string, payload: Partial<TravelPackage>): Promise<TravelPackage> => {
    const current = await packagesApi.getPackages();
    const updated = current.map(p => p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p);
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, {
      content: updated,
    });
    return updated.find(p => p.id === id)!;
  },

  deletePackage: async (id: string): Promise<boolean> => {
    const current = await packagesApi.getPackages();
    const filtered = current.filter(p => p.id !== id);
    await apiClient.put(`/admin/cms-blocks/${CMS_BLOCK_KEY}`, {
      content: filtered,
    });
    return true;
  }
};
