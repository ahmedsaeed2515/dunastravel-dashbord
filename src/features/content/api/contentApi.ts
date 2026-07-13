import { apiClient } from "@/lib/axios";
import { ContentBlock, UpdateContentBlockDto } from "../types";

export const contentApi = {
  getBlocks: async (): Promise<ContentBlock[]> => {
    const { data } = await apiClient.get("/admin/cms");
    return data;
  },
  getBlockByKey: async (key: string): Promise<ContentBlock> => {
    const { data } = await apiClient.get(`/admin/cms/${key}`);
    return data;
  },
  
  updateBlock: async (key: string, payload: UpdateContentBlockDto): Promise<ContentBlock> => {
    const { data } = await apiClient.patch(`/admin/cms/${key}`, payload);
    return data;
  }
};
