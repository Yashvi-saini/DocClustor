import { NextRequest, NextResponse } from 'next/server';
import { createAndSendOtp } from '@backend/services/otp.service';

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({
        success: false,
        message: 'Email and purpose are required',
      }, { status: 400 });
    }

    await createAndSendOtp(email, purpose);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email.',
    }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
