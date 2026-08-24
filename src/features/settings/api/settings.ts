import { apiClient } from '@/lib/axios';

export type SettingValue = string | number | boolean | null;

export interface SettingResponse {
  key: string;
  value: SettingValue;
}

export const getSetting = (key: string): Promise<SettingResponse> =>
  apiClient.get<unknown, SettingResponse>(`/settings/${key}`);

export const updateSetting = (key: string, value: SettingValue): Promise<SettingResponse> =>
  apiClient.put<unknown, SettingResponse>(`/settings/${key}`, { value });
