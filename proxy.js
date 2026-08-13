import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Check if route starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    // Check for better-auth session cookies
    const sessionToken =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token') ||
      request.cookies.get('better-auth.session') ||
      request.cookies.get('session_token') ||
      request.cookies.get('session');

    // If user is not logged in, redirect immediately to /login
    if (!sessionToken || !sessionToken.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
