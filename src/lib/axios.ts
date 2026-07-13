/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
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
apiClient.interceptors.request.use(async (config) => {
  const isMutative = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '');
  
  // Exclude auth routes from needing CSRF token fetching (unless the backend requires it, but usually login doesn't need it or gets it after)
  // Actually, Dunas Travel backend requires double submit cookie CSRF for ALL mutative requests.
  if (isMutative) {
    if (!csrfToken) {
      if (!isFetchingCsrf) {
        isFetchingCsrf = true;
        try {
          // Fetch the CSRF token from the backend
          const response = await axios.get(`${config.baseURL}/auth/csrf`, { withCredentials: true });
          csrfToken = response.data.token;
          isFetchingCsrf = false;
          onCsrfFetched(csrfToken!);
        } catch (error) {
          isFetchingCsrf = false;
          return Promise.reject(error);
        }
      } else {
        // Wait for CSRF token to be fetched by another concurrent request
        await new Promise<void>((resolve) => {
          addCsrfSubscriber((token) => {
            csrfToken = token;
            resolve();
          });
        });
      }
    }
    
    // Attach the token
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth Refresh Management ---
let isRefreshing = false;
let refreshSubscribers: ((token: boolean) => void)[] = [];

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (success: boolean) => void) {
  refreshSubscribers.push(callback);
}

// Response interceptor for global error handling, normalization, and silent refresh
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Global Error Mapping
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };

    // If 401 Unauthorized, attempt a silent refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops and don't try to refresh on the refresh or login endpoint itself
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(customError);
      }

      if (isRefreshing) {
        // Wait for the refresh to finish, then retry the request
        try {
          const success = await new Promise<boolean>((resolve) => {
            addRefreshSubscriber((success) => resolve(success));
          });
          if (success) {
            return apiClient(originalRequest);
          }
        } catch (err) {
          return Promise.reject(customError);
        }
      } else {
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          await axios.post(`${originalRequest.baseURL}/auth/refresh`, {}, { withCredentials: true });
          isRefreshing = false;
          onRefreshed(true);
          
          // Re-fetch CSRF token because the session might have renewed
          csrfToken = null; 
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          onRefreshed(false);
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(customError);
        }
      }
    }

    return Promise.reject(customError);
  }
);
