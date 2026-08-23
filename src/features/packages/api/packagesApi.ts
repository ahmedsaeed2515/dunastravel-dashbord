import { apiClient } from "@/lib/axios";
import { TravelPackage } from "../types";
import { requireObject } from "@/lib/api-response";

const CMS_BLOCK_KEY = "holiday_packages";

function readCatalog(response: unknown): TravelPackage[] {
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
        ? (value.data as { content: TravelPackage[] }).content
        : null;
  if (!content) throw new Error("Invalid packages catalog response");
  return content as TravelPackage[];
}
export const packagesApi = {
  getPackages: async (): Promise<TravelPackage[]> =>
    readCatalog(await apiClient.get(`/admin/cms-blocks/${CMS_BLOCK_KEY}`)),

  createPackage: async (
    pkg: Partial<TravelPackage>,
  ): Promise<TravelPackage> => {
    if (
      !pkg.title?.trim() ||
      !pkg.destination?.trim() ||
      !pkg.duration?.trim() ||
      pkg.price == null
    ) {
      throw new Error(
        "Package title, destination, duration and price are required",
      );
    }
    const now = new Date().toISOString();
    const item = {
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
    const response = await apiClient.post(
      `/admin/cms-blocks/${CMS_BLOCK_KEY}/items`,
      { item },
    );
    return requireObject<TravelPackage>(response, "created package");
  },

  updatePackage: async (
    id: string,
    payload: Partial<TravelPackage>,
  ): Promise<TravelPackage> => {
    const response = await apiClient.patch(
      `/admin/cms-blocks/${CMS_BLOCK_KEY}/items/${id}`,
      {
        item: { ...payload, updatedAt: new Date().toISOString() },
      },
    );
    return requireObject<TravelPackage>(response, "updated package");
  },

  deletePackage: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/admin/cms-blocks/${CMS_BLOCK_KEY}/items/${id}`);
    return true;
  },
};
