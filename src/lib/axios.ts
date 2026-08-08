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
let isFetchingCsrf = false;
let csrfSubscribers: ((token: string) => void)[] = [];

function onCsrfFetched(token: string) {
  csrfSubscribers.forEach((callback) => callback(token));
  csrfSubscribers = [];
}

function addCsrfSubscriber(callback: (token: string) => void) {
  csrfSubscribers.push(callback);
}

// Request Interceptor: Attach CSRF token to mutative requests
apiClient.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase() || '';
    const isMutative = ['post', 'put', 'patch', 'delete'].includes(method);

    if (isMutative) {
      if (!csrfToken) {
        if (!isFetchingCsrf) {
          isFetchingCsrf = true;
          try {
            const baseUrl = config.baseURL || '/api';
            const response = await axios.get(`${baseUrl}/auth/csrf`, {
              withCredentials: true,
            });
            csrfToken = response.data?.token || response.data?.csrfToken || response.data;
            isFetchingCsrf = false;
            if (csrfToken) {
              onCsrfFetched(csrfToken);
            }
          } catch (error) {
            isFetchingCsrf = false;
            return Promise.reject(error);
          }
        } else {
          await new Promise<void>((resolve) => {
            addCsrfSubscriber((token) => {
              csrfToken = token;
              resolve();
            });
          });
        }
      }

      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
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

// Response Interceptor for global unwrapping, error mapping, and silent refresh
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

    // Step 2: Extract items array if present in body.data or body itself
    const items = Array.isArray(body.data)
      ? body.data
      : Array.isArray(body)
      ? body
      : Array.isArray(raw.data)
      ? raw.data
      : null;

    // Step 3: Check for explicit pagination metadata from body or raw
    const hasExplicitTotal =
      typeof body.total === 'number' ||
      typeof body.meta?.total === 'number' ||
      typeof raw.meta?.total === 'number' ||
      typeof raw.total === 'number';

    const total = hasExplicitTotal
      ? typeof body.total === 'number'
        ? body.total
        : typeof body.meta?.total === 'number'
        ? body.meta.total
        : typeof raw.meta?.total === 'number'
        ? raw.meta.total
        : raw.total
      : items
      ? items.length
      : undefined;

    const page =
      typeof body.page === 'number'
        ? body.page
        : typeof body.meta?.page === 'number'
        ? body.meta.page
        : typeof raw.meta?.page === 'number'
        ? raw.meta.page
        : 1;

    const limit =
      typeof body.limit === 'number'
        ? body.limit
        : typeof body.meta?.limit === 'number'
        ? body.meta.limit
        : typeof raw.meta?.limit === 'number'
        ? raw.meta.limit
        : 10;

    const totalPages =
      typeof body.totalPages === 'number'
        ? body.totalPages
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

    // If 401 Unauthorized, attempt a silent refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';
      const redirectToLogin = () => {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          const segments = window.location.pathname.split('/').filter(Boolean);
          const first = segments[0];
          const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(first) ? first : 'ar';
          window.location.href = `/${validLocale}/login`;
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

          csrfToken = null;
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
