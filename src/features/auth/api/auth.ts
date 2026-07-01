import { apiClient } from '@/lib/axios';

export const authApi = {
  login: async (credentials: any) => {
    return await apiClient.post('/auth/login', credentials);
  },
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
  getMe: async () => {
    return await apiClient.get('/auth/me');
  }
};
