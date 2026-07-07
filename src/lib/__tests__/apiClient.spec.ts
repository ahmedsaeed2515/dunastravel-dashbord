import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('apiClient Interceptors', () => {
  let mock: MockAdapter;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    axiosMock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
    axiosMock.restore();
    localStorage.clear();
  });

  it('attempts to refresh token on 401 response and retries original request', async () => {
    // 1. Initial request returns 401
    mock.onGet('/some-protected-route').replyOnce(401);

    // 2. Refresh endpoint returns success on default axios instance
    axiosMock.onPost('http://localhost:5000/api/auth/refresh').replyOnce(200, { accessToken: 'new-token' });

    // 3. Retry of original request returns success
    mock.onGet('/some-protected-route').replyOnce(200, { data: 'success' });

    const response: any = await apiClient.get('/some-protected-route');
    expect(response).toEqual({ data: 'success' });
    
    // Verify the mock history
    expect(mock.history.get.length).toBe(2);
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].url).toBe('http://localhost:5000/api/auth/refresh');
  });

  it('redirects to login if refresh token fails', async () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '', pathname: '' },
      writable: true
    });

    mock.onGet('/some-protected-route').replyOnce(401);
    axiosMock.onPost('http://localhost:5000/api/auth/refresh').replyOnce(401);

    try {
      await apiClient.get('/some-protected-route');
    } catch (e) {
      // Expected
    }

    expect(window.location.href).toBe('/login');
  });
});
