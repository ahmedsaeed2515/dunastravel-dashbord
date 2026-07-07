import { apiClient } from "@/lib/axios";
import { ContentBlock, UpdateContentBlockDto } from "../types";

export const contentApi = {
  getBlocks: async (): Promise<ContentBlock[]> => {
    const { data } = await apiClient.get("/admin/cms");
    return data;
  },
  
  updateBlock: async (key: string, payload: UpdateContentBlockDto): Promise<ContentBlock> => {
    const { data } = await apiClient.patch(`/admin/cms/${key}`, payload);
    return data;
  }
};
