import axios from '@/lib/axios';

export const getSetting = async (key: string) => {
  const { data } = await axios.get(`/settings/${key}`);
  return data;
};

export const updateSetting = async (key: string, value: any) => {
  const { data } = await axios.put(`/settings/${key}`, { value });
  return data;
};
