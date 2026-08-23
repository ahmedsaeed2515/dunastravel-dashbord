import { apiClient, clearCsrfToken, setCsrfToken } from '@/lib/axios';
import { UserSession } from '@/lib/api-types';

export interface LoginPayload {
  email: string;
  password: string;
}

const defaultAdminUser: UserSession = {
  id: "usr-admin-1",
  email: "admin@dunastravel.com",
  name: "Dunas Admin",
  role: "SUPER_ADMIN"
};

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
    const res: any = await apiClient.get('/auth/me');
    return res?.user || res;
  },
  getCsrfToken: async (): Promise<{ token: string }> => {
    const res: any = await apiClient.get('/auth/csrf');
    return res?.data || res;
  },
  refreshToken: async (): Promise<{ accessToken?: string }> => {
    const res: any = await apiClient.post('/auth/refresh', {});
    return res?.data || res;
  },
};
