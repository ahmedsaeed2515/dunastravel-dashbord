import { describe, it, expect } from 'vitest';
import { scrubDashboardData, scrubDashboardEvent } from '../sentry';

describe('Dashboard Sentry Scrubber (Stream 4)', () => {
  it('strips request headers and cookies completely', () => {
    const event = {
      request: {
        headers: { authorization: 'Bearer admin_token_secret' },
        cookies: { access_token: 'admin_cookie' },
        data: { email: 'admin@dunastravel.com' },
      },
    };
    const result = scrubDashboardEvent(event);
    expect(result.request.headers).toBeUndefined();
    expect(result.request.cookies).toBeUndefined();
    expect(result.request.data.email).toBe('[REDACTED]');
  });

  it('redacts tokens and user emails in payload', () => {
    const data = {
      agencyName: 'Luxury Travel Co',
      contact: {
        email: 'agency@partner.com',
        phone: '+201234567890',
        token: 'agency_api_token',
      },
    };
    const cleaned = scrubDashboardData(data);
    expect(cleaned.agencyName).toBe('Luxury Travel Co');
    expect(cleaned.contact.email).toBe('[REDACTED]');
    expect(cleaned.contact.phone).toBe('[REDACTED]');
    expect(cleaned.contact.token).toBe('[REDACTED]');
  });

  it('scrubs user down to id only', () => {
    const event = {
      user: {
        id: 'admin_usr_01',
        email: 'superadmin@dunastravel.com',
      },
    };
    const result = scrubDashboardEvent(event);
    expect(result.user).toEqual({ id: 'admin_usr_01' });
  });
});
