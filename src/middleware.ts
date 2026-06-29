import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // First run the intl middleware to handle locale routing
  const response = intlMiddleware(req);

  const token = req.cookies.get('jwt');
  const pathname = req.nextUrl.pathname;
  
  // Protect dashboard routes
  if (!token && (pathname.includes('/dashboard') || pathname.includes('/admin'))) {
    // Redirect to login if unauthenticated
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Prevent logged-in users from seeing the login page
  if (token && pathname.includes('/login')) {
    const dashUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashUrl);
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*']
};
