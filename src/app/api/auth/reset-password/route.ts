import { NextRequest, NextResponse } from 'next/server';
import { resetUserPassword } from '@backend/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required',
      }, { status: 400 });
    }

    const resetAuthorizedCookie = request.cookies.get('reset_authorized')?.value;
    if (resetAuthorizedCookie !== 'true') {
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

    response.cookies.delete('reset_authorized');

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
