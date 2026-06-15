import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify',
  '/reset-password',
  '/oauth/callback',
];

// Routes related to the auth process itself
const authRoutes = ['/login', '/signup', '/forgot-password', '/verify'];

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';

interface DecodedToken {
  userId: string;
  email: string;
  profileComplete: boolean;
  tokenVersion: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets, public Oauth routes, and internal Next.js files pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/oauth/callback') ||
    pathname.startsWith('/google') ||
    pathname.startsWith('/github')
  ) {
    return NextResponse.next();
  }

  // Retrieve token from cookies (checking both 'token' and 'accessToken')
  const tokenCookie = request.cookies.get('token') || request.cookies.get('accessToken');
  const token = tokenCookie?.value;

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'));
  const isAuthRoute = authRoutes.includes(pathname);

  let decoded: DecodedToken | null = null;

  if (token) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secretKey);
      decoded = payload as unknown as DecodedToken;
    } catch (err) {
      // Token is expired or invalid
      console.error('[Middleware] JWT verification failed:', err);
    }
  }

  // Case 1: Not authenticated and trying to access a protected route
  if (!isPublicRoute && !decoded) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    
    // Clear invalid cookies
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    response.cookies.delete('accessToken');
    return response;
  }

  // Case 2: Authenticated but trying to access login/signup
  if (isAuthRoute && decoded) {
    if (decoded.profileComplete) {
      return NextResponse.redirect(new URL('/dashboard/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Case 3: Authenticated but profile is NOT complete
  // They must complete onboarding and cannot browse the dashboard
  if (decoded && !decoded.profileComplete && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Case 4: Authenticated, profile is complete, trying to go to onboarding
  if (decoded && decoded.profileComplete && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  // Reset password flow gate
  if (pathname === '/reset-password') {
    const hasResetCookie = request.cookies.has('reset_authorized');
    if (!hasResetCookie) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
