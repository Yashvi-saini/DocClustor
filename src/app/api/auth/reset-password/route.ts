import { NextRequest, NextResponse } from 'next/server';
import { resetUserPassword } from '@backend/services/auth.service';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';
import { readResetSession, RESET_COOKIE } from '@backend/utils/session';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json({
        success: false,
        message: 'Password must be between 8 and 128 characters',
      }, { status: 400 });
    }

    const email = await readResetSession(request);
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Reset request unauthorized or expired. Please complete the OTP check again.',
      }, { status: 401 });
    }

    await resetUserPassword(email, password);

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successful.',
    }, { status: 200 });

    response.cookies.set(RESET_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });

    return response;
  } catch (error: unknown) {
    const message = sanitizeAuthError(error, 'Failed to reset password');
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
