import { apiClient, clearCsrfToken, setCsrfToken } from '@/lib/axios';
import { UserSession } from '@/lib/api-types';

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse extends UserSession {
  user?: UserSession;
  csrfToken?: string;
}

function requireUserSession(value: unknown): UserSession {
  if (!value || typeof value !== 'object') throw new Error('Invalid user session response');
  const envelope = value as { user?: unknown };
  const candidate = envelope.user ?? value;
  if (!candidate || typeof candidate !== 'object') throw new Error('Invalid user session response');
  const user = candidate as Partial<UserSession>;
  if (!user.id || !user.email || !user.name || !user.role) {
    throw new Error('Invalid user session response');
  }
  return user as UserSession;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<{ user: UserSession; csrfToken?: string }> => {
    clearCsrfToken();
    const res = await apiClient.post<unknown, LoginResponse>('/auth/login', credentials);
    if (res && typeof res === 'object' && res.csrfToken && typeof res.csrfToken === 'string') {
      setCsrfToken(res.csrfToken);
    }
    const { csrfToken, ...sessionResponse } = res;
    const user = requireUserSession(sessionResponse);
    return { user, csrfToken };
  },
  logout: async (): Promise<{ message: string }> => {
    try {
      return await apiClient.post('/auth/logout', {});
    } finally {
      clearCsrfToken();
    }
  },
  getMe: async (): Promise<UserSession> => {
    const res = await apiClient.get('/auth/me');
    return requireUserSession(res);
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
