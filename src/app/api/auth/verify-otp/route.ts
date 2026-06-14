// ─── POST /api/auth/verify-otp ──────────────────────────────────────────────────
//
// Verifies if the provided OTP code matches the database record and is active.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpInDb } from '@backend/services/otp.service';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose } = await request.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json({
        success: false,
        message: 'Email, otp, and purpose are required',
      }, { status: 400 });
    }

    const isValid = await verifyOtpInDb(email, otp, purpose);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid or expired OTP. Please try again.',
    }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
