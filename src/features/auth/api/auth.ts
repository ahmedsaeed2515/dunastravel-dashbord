import { apiClient } from '@/lib/axios';

export const authApi = {
  login: async (credentials: any) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data ?? res;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data ?? res;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data ?? res;
  }
};
