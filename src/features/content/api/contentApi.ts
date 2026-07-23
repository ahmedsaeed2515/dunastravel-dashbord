import { apiClient } from "@/lib/axios";
import { ContentBlock, UpdateContentBlockDto } from "../types";

export const contentApi = {
  getBlocks: async (): Promise<ContentBlock[]> => {
    const response = await apiClient.get("/admin/cms");
    return response as any;
  },
  getBlockByKey: async (key: string): Promise<ContentBlock> => {
    const response = await apiClient.get(`/admin/cms/${key}`);
    return response as any;
  },
  
  updateBlock: async (key: string, payload: UpdateContentBlockDto): Promise<ContentBlock> => {
    const response = await apiClient.patch(`/admin/cms/${key}`, payload);
    return response as any;
  }
};
