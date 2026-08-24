 
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient } from '../axios';
import axios from 'axios';

vi.mock('axios', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
      post: vi.fn(),
      create: actual.default.create,
    },
  };
});

describe('apiClient Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('rejects a legacy double-wrapped response instead of guessing its shape', () => {
    const successInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    const rawResponse = {
      data: {
        data: {
          success: true,
          statusCode: 200,
          data: [
            {
              id: "2763530b-eb78-4287-9a8f-4c54449a3c08",
              referenceCode: "BKG-COMP-NKA94T",
              status: "CANCELLED",
              totalAmount: "1780",
              currency: "USD",
              passengerCount: 2,
              tourId: "98cb34f1-ec69-4ecf-9ebc-c98d72fd66c8",
              tourSlug: "cairo-express-4d",
              tourNameEn: "Cairo Express",
              invoiceNumber: null,
              createdAt: "2026-07-13T20:59:28.654Z"
            }
          ],
          total: 60,
          page: 1,
          limit: 10,
          totalPages: 6,
          timestamp: "2026-07-23T18:56:31.593Z"
        },
        meta: {
          timestamp: "2026-07-23T18:56:31.593Z"
        }
      }
    };
    expect(() => successInterceptor(rawResponse)).toThrow('Invalid API success envelope');
  });

  it('unwraps paginated NestJS response while preserving meta metadata', () => {
    const successInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    const rawResponse = {
      data: {
        success: true,
        statusCode: 200,
        data: [{ id: '1', name: 'Tour' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
      }
    };
    const result = successInterceptor(rawResponse);
    expect(result).toEqual({
      data: [{ id: '1', name: 'Tour' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });
  });

  it('rejects HTTP-success envelopes whose business operation failed', () => {
    const successInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    expect(() => successInterceptor({ data: { success: true, statusCode: 200, data: { success: false, code: 'CONFLICT', message: 'Conflict' } } }))
      .toThrow('Conflict');
  });

  it('preserves zero, false, null, and an empty collection without fallback coercion', () => {
    const successInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    expect(successInterceptor({ data: { success: true, statusCode: 200, data: { zero: 0, enabled: false, optional: null } } }))
      .toEqual({ zero: 0, enabled: false, optional: null });
    expect(successInterceptor({ data: { success: true, statusCode: 200, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } }))
      .toEqual({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  });

  it('unwraps non-paginated NestJS response data payload directly', () => {
    const successInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    const rawResponse = {
      data: {
        success: true,
        statusCode: 200,
        data: { totalTours: 10, publishedTours: 8 }
      }
    };
    const result = successInterceptor(rawResponse);
    expect(result).toEqual({ totalTours: 10, publishedTours: 8 });
  });

  it('attempts to refresh token on 401 response and retries original request', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { accessToken: 'new-token' } });

    const error401 = {
      config: { url: '/some-protected-route', _retry: false, baseURL: '/api' },
      response: { status: 401, data: { message: 'Unauthorized' } },
    };

    const errorInterceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
    const retryPromise = errorInterceptor(error401).catch(() => {});
    expect(postSpy).toHaveBeenCalled();
    await retryPromise;
  });

  it('redirects to login if refresh token fails', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: '', pathname: '/dashboard' },
      writable: true,
    });

    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));

    const error401 = {
      config: { url: '/some-protected-route', _retry: false, baseURL: '/api' },
      response: { status: 401, data: { message: 'Unauthorized' } },
    };

    const errorInterceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    try {
      await errorInterceptor(error401);
    } catch {
      // Expected
    }

    expect(window.location.href).toBe('/ar/login?expired=1');
  });

  it('handles 403 Invalid CSRF token error by refreshing token and retrying request', async () => {
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        statusCode: 200,
        data: { csrfToken: 'new-valid-csrf-token-123456789' },
      },
    });

    const error403 = {
      config: { url: '/admin/tours/wonders-of-egypt', method: 'patch', headers: {} },
      response: { status: 403, data: { message: 'Invalid CSRF token' } },
    };

    const errorInterceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
    const retryPromise = errorInterceptor(error403).catch(() => {});
    expect(getSpy).toHaveBeenCalled();
    await retryPromise;
  });
});
