import { apiClient, clearCsrfToken, setCsrfToken } from '@/lib/axios';
import { UserSession } from '@/lib/api-types';

export interface LoginPayload { email: string; password: string; }
export interface LoginResponse extends UserSession { csrfToken?: string; }

/** Auth state is server-issued only. Transport failures must never create a session. */
export const authApi = {
  async login(credentials: LoginPayload): Promise<LoginResponse> {
    clearCsrfToken();
    const user = await apiClient.post<LoginResponse, LoginResponse>('/auth/login', credentials);
    if (typeof user.csrfToken === 'string') setCsrfToken(user.csrfToken);
    return user;
  },
  async logout(): Promise<{ message: string }> {
    try { return await apiClient.post<{ message: string }, { message: string }>('/auth/logout', {}); }
    finally { clearCsrfToken(); }
  },
  getMe: (): Promise<UserSession> => apiClient.get<UserSession, UserSession>('/auth/me'),
  getCsrfToken: (): Promise<{ csrfToken: string }> => apiClient.get<{ csrfToken: string }, { csrfToken: string }>('/auth/csrf'),
  refreshToken: (): Promise<{ message: string }> => apiClient.post<{ message: string }, { message: string }>('/auth/refresh', {}),
};
