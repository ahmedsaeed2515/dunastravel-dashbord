import { apiClient } from '@/lib/axios';
import { UserSession } from '@/lib/api-types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<{ user: UserSession }> => {
    return apiClient.post('/auth/login', credentials);
  },
  logout: async (): Promise<{ message: string }> => {
    return apiClient.post('/auth/logout', {});
  },
  getMe: async (): Promise<UserSession> => {
    return apiClient.get('/auth/me');
  },
  getCsrfToken: async (): Promise<{ token: string }> => {
    return apiClient.get('/auth/csrf');
  },
  refreshToken: async (): Promise<{ accessToken?: string }> => {
    return apiClient.post('/auth/refresh', {});
  },
};
