import { apiClient } from '@/lib/axios';

export const getSetting = async (key: string) => {
  const response = await apiClient.get(`/settings/${key}`);
  return response as any;
};

export const updateSetting = async (key: string, value: any) => {
  const response = await apiClient.put(`/settings/${key}`, { value });
  return response as any;
};
