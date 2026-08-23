import axios from 'axios';
import { env } from '@/config/env';
import { ApiError } from './api-types';

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
      const raw = response.data;
      const extractedToken =
        raw?.data?.csrfToken ||
        raw?.data?.token ||
        raw?.csrfToken ||
        raw?.token ||
        (typeof raw === 'string' ? raw : null);

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
let refreshSubscribers: ((success: boolean) => void)[] = [];

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (success: boolean) => void) {
  refreshSubscribers.push(callback);
}

// Response Interceptor for global unwrapping, error mapping, silent refresh, and CSRF retry
apiClient.interceptors.response.use(
  (response) => {
    const raw = response.data;
    if (!raw || typeof raw !== 'object') {
      return raw;
    }

    // Step 1: Unwrap outer NestJS envelope if raw is { data: { ... }, meta: ... } or { data: { success: true, data: ... } }
    let body = raw;
    if (
      raw.data &&
      typeof raw.data === 'object' &&
      !Array.isArray(raw.data) &&
      ('data' in raw.data || 'success' in raw.data)
    ) {
      body = raw.data;
    }

    // Step 2: Extract items array if present in body.items, body.data, or body itself
    const items =
      Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.data?.items)
        ? body.data.items
        : Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
        ? body
        : Array.isArray(raw.data?.items)
        ? raw.data.items
        : Array.isArray(raw.data)
        ? raw.data
        : null;

    // Step 3: Check for explicit pagination metadata from body or raw
    const hasExplicitTotal =
      typeof body.total === 'number' ||
      typeof body.data?.total === 'number' ||
      typeof body.meta?.total === 'number' ||
      typeof raw.meta?.total === 'number' ||
      typeof raw.data?.total === 'number' ||
      typeof raw.total === 'number';

    const total = hasExplicitTotal
      ? typeof body.total === 'number'
        ? body.total
        : typeof body.data?.total === 'number'
        ? body.data.total
        : typeof body.meta?.total === 'number'
        ? body.meta.total
        : typeof raw.meta?.total === 'number'
        ? raw.meta.total
        : typeof raw.data?.total === 'number'
        ? raw.data.total
        : raw.total
      : items
      ? items.length
      : undefined;

    const page =
      typeof body.page === 'number'
        ? body.page
        : typeof body.data?.page === 'number'
        ? body.data.page
        : typeof body.meta?.page === 'number'
        ? body.meta.page
        : typeof raw.meta?.page === 'number'
        ? raw.meta.page
        : 1;

    const limit =
      typeof body.limit === 'number'
        ? body.limit
        : typeof body.data?.limit === 'number'
        ? body.data.limit
        : typeof body.meta?.limit === 'number'
        ? body.meta.limit
        : typeof raw.meta?.limit === 'number'
        ? raw.meta.limit
        : 10;

    const totalPages =
      typeof body.totalPages === 'number'
        ? body.totalPages
        : typeof body.data?.totalPages === 'number'
        ? body.data.totalPages
        : typeof body.meta?.totalPages === 'number'
        ? body.meta.totalPages
        : typeof raw.meta?.totalPages === 'number'
        ? raw.meta.totalPages
        : total !== undefined && limit > 0
        ? Math.ceil(total / limit)
        : 1;

    // Step 4: If items is an array and endpoint has explicit pagination, return { data: items, meta: {...} }
    if (items !== null && hasExplicitTotal) {
      return {
        data: items,
        meta: {
          total,
          page,
          limit,
          totalPages: totalPages > 0 ? totalPages : 1,
        },
      };
    }

    // Step 5: If items is a non-paginated array, return items array directly
    if (items !== null) {
      return items;
    }

    // Step 6: If body has a single item / object payload in body.data, return body.data
    if ('data' in body && body.data !== undefined) {
      return body.data;
    }

    return body;
  },
  async (error) => {
    const originalRequest = error.config || {};

    const customError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
      errors: error.response?.data?.errors,
    };

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
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
