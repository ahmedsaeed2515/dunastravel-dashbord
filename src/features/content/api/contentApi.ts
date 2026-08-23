import { apiClient } from "@/lib/axios";
import { ContentBlock, UpdateContentBlockDto } from "../types";

export const contentApi = {
  getBlocks: async (): Promise<ContentBlock[]> => {
    const response: any = await apiClient.get("/admin/cms");
    if (Array.isArray(response)) return response;
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error("Invalid CMS blocks response");
  },
  getBlockByKey: async (key: string): Promise<ContentBlock> => {
    const response: any = await apiClient.get(`/admin/cms/${key}`);
    return (response && typeof response === "object" && "data" in response) ? response.data : response;
  },
  
  updateBlock: async (key: string, payload: UpdateContentBlockDto): Promise<ContentBlock> => {
    const response: any = await apiClient.patch(`/admin/cms/${key}`, payload);
    return (response && typeof response === "object" && "data" in response) ? response.data : response;
  }
};
