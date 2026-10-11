import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@backend/services/auth.service';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';
import { rateLimit, clientIp } from '@backend/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, emailOrPhoneOrUsername } = body;
    const resolvedEmail = email || emailOrPhoneOrUsername;

    // Basic validation
    if (!resolvedEmail || !password || typeof resolvedEmail !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const limitIp = rateLimit(`login:ip:${clientIp(request)}`, 30, 10 * 60_000);
    const limitAcct = rateLimit(`login:acct:${resolvedEmail.toLowerCase()}`, 8, 10 * 60_000);
    if (!limitIp.ok || !limitAcct.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(limitIp.retryAfterSec, limitAcct.retryAfterSec)) } }
      );
    }

    const { user, token } = await loginUser({ email: resolvedEmail, password });

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });

    // Set the JWT token as an HttpOnly cookie 
    response.cookies.set('token', token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',     
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const message = sanitizeAuthError(error, 'Login failed');
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
