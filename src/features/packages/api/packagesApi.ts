import { apiClient } from "@/lib/axios";
import { TravelPackage } from "../types";

const CMS_BLOCK_KEY = "holiday_packages";

export const packagesApi = {
  getPackages: async (): Promise<TravelPackage[]> => {
    try {
      const res = await apiClient.get(`/cms/blocks/${CMS_BLOCK_KEY}`);
      if (res.data && Array.isArray(res.data.content)) {
        return res.data.content;
      }
      if (res.data?.content && typeof res.data.content === "object" && Array.isArray(res.data.content.items)) {
        return res.data.content.items;
      }
    } catch {
      // Fallback default packages if not seeded yet
    }

    return [
      {
        id: "pkg-egypt-classic",
        title: "برنامج مصر الكلاسيكي الشامل (القاهرة والنيل)",
        slug: "egypt-classic-package",
        destination: "Multi-City Egypt",
        duration: "8 أيام / 7 ليالي",
        price: 1850,
        type: "Classic Holiday",
        popular: true,
        description: "رحلة كلاسيكية فاخرة تشمل أهرامات الجيزة، المتحف الكبير، وإقامة كروز 5 نجوم بين الأقصر وأسوان.",
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "pkg-egypt-dubai",
        title: "باكدج مصر ودبي الفاخر (Multi-Country)",
        slug: "egypt-dubai-combo",
        destination: "Multi-Country",
        duration: "10 أيام / 9 ليالي",
        price: 2450,
        type: "Luxury Combo",
        popular: true,
        description: "أفضل دمج بين سحر الحضارة الفرعونية وفخامة أبراج وتسوق دبي مع إقامة في فنادق 5 نجوم.",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "pkg-honeymoon-redsea",
        title: "باكدج شهر العسل (القاهرة والجونة)",
        slug: "honeymoon-red-sea",
        destination: "Egypt Resorts",
        duration: "7 أيام / 6 ليالي",
        price: 1650,
        type: "Honeymoon",
        popular: false,
        description: "عطلة رومانسية هادئة تشمل منتجعات الجونة الفاخرة، يخت خاص في البحر الأحمر، وعشاء فاخر على ضفاف النيل.",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80"
      }
    ];
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
    await apiClient.post(`/cms/blocks/${CMS_BLOCK_KEY}`, {
      content: updated,
    });
    return newPkg;
  },

  updatePackage: async (id: string, payload: Partial<TravelPackage>): Promise<TravelPackage> => {
    const current = await packagesApi.getPackages();
    const updated = current.map(p => p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p);
    await apiClient.post(`/cms/blocks/${CMS_BLOCK_KEY}`, {
      content: updated,
    });
    return updated.find(p => p.id === id)!;
  },

  deletePackage: async (id: string): Promise<boolean> => {
    const current = await packagesApi.getPackages();
    const filtered = current.filter(p => p.id !== id);
    await apiClient.post(`/cms/blocks/${CMS_BLOCK_KEY}`, {
      content: filtered,
    });
    return true;
  }
};
