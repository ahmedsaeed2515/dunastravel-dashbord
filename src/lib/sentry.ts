/**
 * Admin Dashboard Sentry Observability Layer for Dunas Travel
 * - Lazy initialization strictly dependent on NEXT_PUBLIC_SENTRY_DSN
 * - Zero-crash guarantee if DSN or package is absent
 * - Admin credentials & client-side PII scrubbing
 */

const PII_KEYS = [
  'password',
  'token',
  'auth',
  'cookie',
  'secret',
  'email',
  'phone',
  'passport',
  'card',
  'cvv',
];

export function scrubDashboardData(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    return data
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
      .replace(/\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g, '[REDACTED_JWT]');
  }
  if (Array.isArray(data)) {
    return data.map(scrubDashboardData);
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const lower = key.toLowerCase().replace(/[-_]/g, '');
      if (PII_KEYS.some((k) => lower.includes(k))) {
        clean[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = scrubDashboardData(val);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }
  return data;
}

export function scrubDashboardEvent(event: any): any | null {
  if (!event) return null;

  if (event.request) {
    delete event.request.headers;
    delete event.request.cookies;
    if (event.request.data) {
      event.request.data = scrubDashboardData(event.request.data);
    }
  }

  if (event.user) {
    event.user = { id: event.user.id ? String(event.user.id) : undefined };
  }

  if (Array.isArray(event.breadcrumbs)) {
    for (const b of event.breadcrumbs) {
      if (b.data) b.data = scrubDashboardData(b.data);
    }
  }

  return event;
}

let isDashboardInitialized = false;

export async function initDashboardSentry(): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || isDashboardInitialized) return;

  try {
    const sentryPkg = '@sentry/nextjs';
    const Sentry = await import(/* @vite-ignore */ sentryPkg);
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'production',
      release: process.env.NEXT_PUBLIC_RELEASE || 'dunastravel-dashboard@1.0.0',
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend: scrubDashboardEvent,
    });
    isDashboardInitialized = true;
    console.info('[Sentry] Dashboard observability initialized.');
  } catch (err: any) {
    console.warn('[Sentry] Next.js Sentry package absent or initialization skipped:', err?.message);
  }
}

export function captureDashboardException(error: any, context?: any): void {
  if (!isDashboardInitialized) {
    console.error('[Dashboard Error Captured]', error, context);
    return;
  }
  try {
    const sentryPkg = '@sentry/nextjs';
    import(/* @vite-ignore */ sentryPkg).then((Sentry) => {
      Sentry.captureException(error, { extra: scrubDashboardData(context) });
    });
  } catch {
    // Fail silently
  }
}
