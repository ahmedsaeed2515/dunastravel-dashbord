import axios from 'axios';
import { env } from '@/config/env';
import { ApiError, normalizeApiError, unwrapApiEnvelope } from './api-types';

const isServer = typeof window === 'undefined';

export const apiClient = axios.create({
  baseURL: isServer ? env.NEXT_PUBLIC_API_URL : '/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CSRF Token Management ---
let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string | null> | null = null;

function getCsrfFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]).trim();
      return decoded.length >= 16 ? decoded : null;
    } catch {
      return match[1].length >= 16 ? match[1] : null;
    }
  }
  return null;
}

export function setCsrfToken(token: string | null) {
  if (typeof token === 'string' && token.trim().length >= 16) {
    csrfToken = token.trim();
  } else {
    csrfToken = null;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfFetchPromise = null;
}

export async function initCsrfToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh) {
    const cookieToken = getCsrfFromCookie();
    if (cookieToken) {
      csrfToken = cookieToken;
      return csrfToken;
    }
    if (csrfToken && typeof csrfToken === 'string' && csrfToken.length >= 16) {
      return csrfToken;
    }
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  csrfFetchPromise = (async () => {
    try {
      const baseUrl = isServer ? env.NEXT_PUBLIC_API_URL : '/api';
      const response = await axios.get(`${baseUrl}/auth/csrf`, {
        withCredentials: true,
      });
      const csrfPayload = unwrapApiEnvelope<{ csrfToken?: string }>(response.data);
      const extractedToken = csrfPayload.csrfToken ?? null;

      if (typeof extractedToken === 'string' && extractedToken.trim().length >= 16) {
        csrfToken = extractedToken.trim();
      } else {
        const cookieToken = getCsrfFromCookie();
        if (cookieToken) {
          csrfToken = cookieToken;
        }
      }
      return csrfToken;
    } catch (err) {
      const cookieToken = getCsrfFromCookie();
      if (cookieToken) {
        csrfToken = cookieToken;
      }
      return csrfToken;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
}

// Request Interceptor: Attach CSRF token to mutative requests
apiClient.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase() || '';
    const isMutative = ['post', 'put', 'patch', 'delete'].includes(method);

    if (isMutative) {
      const token = await initCsrfToken();
      if (token) {
        config.headers['x-csrf-token'] = token;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Refresh Management ---
let isRefreshing = false;
let isRedirecting = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (success: boolean) => void) {
  refreshSubscribers.push(callback);
}

apiClient.interceptors.response.use(
  (response) => {
    isRedirecting = false;
    return unwrapApiEnvelope(response.data);
  },
  async (error) => {
    const originalRequest = error.config || {};

    const customError: ApiError = normalizeApiError({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });

    // If 403 Invalid CSRF token, auto-heal by fetching fresh token and retrying once
    const isCsrfError =
      error.response?.status === 403 &&
      typeof error.response?.data?.message === 'string' &&
      error.response.data.message.toLowerCase().includes('csrf');

    if (isCsrfError && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      clearCsrfToken();
      const freshToken = await initCsrfToken(true);
      if (freshToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['x-csrf-token'] = freshToken;
        return apiClient(originalRequest);
      }
    }

    // If 401 Unauthorized, attempt a silent refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';
      const redirectToLogin = async () => {
        if (isRedirecting) return;
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          isRedirecting = true;
          const baseUrl = originalRequest.baseURL || '/api';
          try {
            await axios.post(`${baseUrl}/auth/logout`, {}, { withCredentials: true });
          } catch {
            // Ignore error during cleanup
          }
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;';
          const segments = window.location.pathname.split('/').filter(Boolean);
          const first = segments[0];
          const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(first) ? first : 'ar';
          window.location.href = `/${validLocale}/login?expired=1`;
        }
      };

      if (requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/login')) {
        redirectToLogin();
        return Promise.reject(customError);
      }

      if (isRefreshing) {
        try {
          const success = await new Promise<boolean>((resolve) => {
            addRefreshSubscriber((succ) => resolve(succ));
          });
          if (success) {
            return apiClient(originalRequest);
          }
        } catch {
          return Promise.reject(customError);
        }
      } else {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const baseUrl = originalRequest.baseURL || '/api';
          await axios.post(`${baseUrl}/auth/refresh`, {}, { withCredentials: true });
          isRefreshing = false;
          onRefreshed(true);

          clearCsrfToken();
          return apiClient(originalRequest);
        } catch {
          isRefreshing = false;
          onRefreshed(false);
          redirectToLogin();
          return Promise.reject(customError);
        }
      }
    }

    return Promise.reject(customError);
  }
);
