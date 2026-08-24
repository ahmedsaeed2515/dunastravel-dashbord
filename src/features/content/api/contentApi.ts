import { apiClient } from "@/lib/axios";
import { ContentBlock, ContentBlocksPage, UpdateContentBlockDto } from "../types";

export const contentApi = {
  getBlocks: async (): Promise<ContentBlocksPage> => {
    return apiClient.get<ContentBlocksPage, ContentBlocksPage>('/admin/cms');
  },
  getBlockByKey: async (key: string): Promise<ContentBlock> => {
    return apiClient.get<ContentBlock, ContentBlock>(`/admin/cms/${key}`);
  },
  
  updateBlock: async (key: string, payload: UpdateContentBlockDto): Promise<ContentBlock> => {
    return apiClient.patch<ContentBlock, ContentBlock>(`/admin/cms/${key}`, payload);
  }
};
