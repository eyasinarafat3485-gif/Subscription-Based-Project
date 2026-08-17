import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Check if route starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    // Check for better-auth session cookies
    const sessionToken =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token') ||
      request.cookies.get('better-auth.session') ||
      request.cookies.get('session_token') ||
      request.cookies.get('session');

    // If user is not logged in, redirect immediately to /login with return URL
    if (!sessionToken || !sessionToken.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
