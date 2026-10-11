import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpInDb } from '@backend/services/otp.service';
import { markEmailAsVerified } from '@backend/services/auth.service';
import { rateLimit, clientIp } from '@backend/utils/rate-limit';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Email and otp are required',
      }, { status: 400 });
    }

    const limited = rateLimit(`verify-email:${clientIp(request)}:${email.toLowerCase()}`, 10, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const isValid = await verifyOtpInDb(email, otp, 'register');

    if (isValid) {
      const { user, token } = await markEmailAsVerified(email);

      const response = NextResponse.json({
        success: true,
        message: 'Email verified successfully.',
        data: { user },
      }, { status: 200 });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid or expired OTP. Please try again.',
    }, { status: 400 });
  } catch (error: unknown) {
    const message = sanitizeAuthError(error, 'Verification failed');
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
