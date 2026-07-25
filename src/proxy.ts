import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, Next.js internals, and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');
  const token = accessToken || refreshToken;
  const isLoginPage = pathname.includes('/login');

  // If no token and not on login page, redirect to localized login
  if (!token && !isLoginPage) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const validLocale = (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;
    const loginUrl = new URL(`/${validLocale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and on login page, redirect to localized dashboard
  if (token && isLoginPage) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const validLocale = (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;
    const dashboardUrl = new URL(`/${validLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Apply next-intl middleware for internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|ar|es|pt|it)/:path*'],
};
