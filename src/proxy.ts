import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // First run the intl middleware to handle locale routing
  const response = intlMiddleware(req);

  const accessToken = req.cookies.get('access_token');
  const refreshToken = req.cookies.get('refresh_token');
  const hasAuth = !!(accessToken || refreshToken);
  
  const pathname = req.nextUrl.pathname;
  
  // Extract locale from pathname (e.g., /en/login -> en)
  const localeMatch = pathname.match(/^\/(en|ar)/);
  const currentLocale = localeMatch ? localeMatch[1] : 'en';
  
  // Protect dashboard routes
  if (!hasAuth && (pathname.includes('/dashboard') || pathname.includes('/admin'))) {
    // Redirect to login if unauthenticated
    const loginUrl = new URL(`/${currentLocale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Prevent logged-in users from seeing the login page
  if (hasAuth && pathname.includes('/login')) {
    const dashUrl = new URL(`/${currentLocale}/dashboard`, req.url);
    return NextResponse.redirect(dashUrl);
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*']
};
