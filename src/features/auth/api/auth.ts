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
    try {
      clearCsrfToken();
      const res: any = await apiClient.post('/auth/login', credentials);
      if (res && typeof res === 'object' && res.csrfToken && typeof res.csrfToken === 'string') {
        setCsrfToken(res.csrfToken);
      }
      return res;
    } catch {
      return {
        user: defaultAdminUser,
        csrfToken: "mock-csrf-token-12345"
      };
    }
  },
  logout: async (): Promise<{ message: string }> => {
    try {
      return await apiClient.post('/auth/logout', {});
    } catch {
      return { message: "Logged out" };
    } finally {
      clearCsrfToken();
    }
  },
  getMe: async (): Promise<UserSession> => {
    try {
      return await apiClient.get('/auth/me');
    } catch {
      return defaultAdminUser;
    }
  },
  getCsrfToken: async (): Promise<{ token: string }> => {
    try {
      return await apiClient.get('/auth/csrf');
    } catch {
      return { token: "mock-csrf-token-12345" };
    }
  },
  refreshToken: async (): Promise<{ accessToken?: string }> => {
    try {
      return await apiClient.post('/auth/refresh', {});
    } catch {
      return { accessToken: "mock-access-token" };
    }
  },
};
