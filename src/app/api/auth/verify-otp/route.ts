import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpInDb, isOtpPurpose } from '@backend/services/otp.service';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';
import { rateLimit, clientIp } from '@backend/utils/rate-limit';
import { setResetSession } from '@backend/utils/session';

const PUBLIC_PURPOSES = ['register', 'login', 'forgot'];

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose } = await request.json();

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string' || !isOtpPurpose(purpose) || !PUBLIC_PURPOSES.includes(purpose)) {
      return NextResponse.json({
        success: false,
        message: 'Email, otp, and purpose are required',
      }, { status: 400 });
    }

    const limited = rateLimit(`otp-verify:${clientIp(request)}:${email.toLowerCase()}`, 10, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const isValid = await verifyOtpInDb(email, otp, purpose);

    if (isValid) {
      const response = NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
      }, { status: 200 });

      if (purpose === 'forgot') {
        await setResetSession(response, email.trim().toLowerCase());
      }
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
