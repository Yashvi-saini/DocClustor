import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/verify',
    '/reset-password',
    '/oauth/callback',
    '/api/auth',
];

const authRoutes = ['/login', '/signup', '/forgot-password', '/verify'];

const flowProtectedRoutes = {
    '/reset-password': 'reset_authorized', // Cookie name
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`[Middleware] Processing request for: ${pathname}`);


    if (pathname.startsWith('/oauth/callback') || pathname.startsWith('/google') || pathname.startsWith('/github')) {
        console.log(`[Middleware] Allowing public auth route: ${pathname}`);
        return NextResponse.next();
    }

    const hasAuthToken = request.cookies.has('token') || request.cookies.has('accessToken') || request.cookies.has('connect.sid') || request.cookies.has('is_authenticated');
    console.log(`[Middleware] Has Auth Token: ${hasAuthToken}`);

    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'));
    const isAuthRoute = authRoutes.includes(pathname);

    if (!isPublicRoute && !hasAuthToken) {
        // Skip next internal paths
        if (!pathname.startsWith('/_next') && !pathname.startsWith('/static') && !pathname.includes('.')) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (isAuthRoute && hasAuthToken) {
        return NextResponse.redirect(new URL('/dummydash', request.url));
    }

    if (pathname === '/reset-password') {
        const hasResetCookie = request.cookies.has('reset_authorized');
        if (!hasResetCookie) {
            return NextResponse.redirect(new URL('/forgot-password', request.url));
        }
    }

    if (pathname === '/verify') {
        const emailParam = request.nextUrl.searchParams.get('email');
        if (!emailParam) {
            return NextResponse.redirect(new URL('/signup', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
