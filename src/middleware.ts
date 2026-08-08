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

  // Detect locale from pathname or cookie or default
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const isValidLocale = firstSegment && (routing.locales as readonly string[]).includes(firstSegment);
  
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const validLocale = isValidLocale 
    ? firstSegment 
    : (savedLocale && (routing.locales as readonly string[]).includes(savedLocale) ? savedLocale : routing.defaultLocale);

  const isLoginPage = pathname.includes('/login');
  const isExplicitLogin = request.nextUrl.searchParams.has('expired') || request.nextUrl.searchParams.has('logout');

  // Handle direct unlocalized /login or /login/
  if (pathname === '/login' || pathname === '/login/') {
    if (token && !isExplicitLogin) {
      return NextResponse.redirect(new URL(`/${validLocale}/dashboard`, request.url));
    }
    return NextResponse.redirect(new URL(`/${validLocale}/login`, request.url));
  }

  // Handle direct root /
  if (pathname === '/' || pathname === '') {
    if (token) {
      return NextResponse.redirect(new URL(`/${validLocale}/dashboard`, request.url));
    }
    return NextResponse.redirect(new URL(`/${validLocale}/login`, request.url));
  }

  // If no token and trying to access protected route (not on login page)
  if (!token && !isLoginPage) {
    const loginUrl = new URL(`/${validLocale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and on login page, redirect to dashboard unless explicitly logging in/expired
  if (token && isLoginPage && !isExplicitLogin) {
    const dashboardUrl = new URL(`/${validLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Apply next-intl middleware for internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
