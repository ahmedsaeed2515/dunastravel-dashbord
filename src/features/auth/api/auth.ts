import { apiClient, clearCsrfToken, setCsrfToken } from '@/lib/axios';
import { UserSession } from '@/lib/api-types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<{ user: UserSession; csrfToken?: string }> => {
    clearCsrfToken();
    const res: any = await apiClient.post('/auth/login', credentials);
    if (res && typeof res === 'object' && res.csrfToken && typeof res.csrfToken === 'string') {
      setCsrfToken(res.csrfToken);
    }
    return res;
  },
  logout: async (): Promise<{ message: string }> => {
    try {
      return await apiClient.post('/auth/logout', {});
    } finally {
      clearCsrfToken();
    }
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
