import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isAdminPage = pathname.startsWith('/admin');
  const isLearnPage = pathname.includes('/learn');

  if (token) {
    const payload = decodeJwt(token);
    const isValid = payload && payload.exp * 1000 > Date.now();

    if (isValid) {
      // If user is logged in, redirect them away from auth pages
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If user is trying to access admin pages but is not an admin, redirect to dashboard
      if (isAdminPage && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    }
  }

  // If user is not logged in and tries to access protected pages, redirect to login
  if (isDashboardPage || isAdminPage || isLearnPage) {
    const loginUrl = new URL('/login', request.url);
    // Keep search params or redirect path if needed
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/courses/:slug/learn',
    '/login',
    '/register',
  ],
};
