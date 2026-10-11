import { NextRequest, NextResponse } from 'next/server';
import { createAndSendOtp, isOtpPurpose } from '@backend/services/otp.service';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';
import { rateLimit, clientIp } from '@backend/utils/rate-limit';
import { prisma } from '@backend/db/prisma';

const PUBLIC_PURPOSES = ['register', 'login', 'forgot'];
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json();

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email) || !isOtpPurpose(purpose) || !PUBLIC_PURPOSES.includes(purpose)) {
      return NextResponse.json({
        success: false,
        message: 'A valid email and purpose are required',
      }, { status: 400 });
    }

    const limitedIp = rateLimit(`otp-send:ip:${clientIp(request)}`, 10, 10 * 60_000);
    const limitedEmail = rateLimit(`otp-send:email:${email.toLowerCase()}`, 5, 10 * 60_000);
    if (!limitedIp.ok || !limitedEmail.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(limitedIp.retryAfterSec, limitedEmail.retryAfterSec)) } }
      );
    }

    if (purpose === 'forgot') {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } },
        select: { emailVerified: true },
      });
      if (user?.emailVerified) {
        await createAndSendOtp(email, purpose);
      }
    } else {
      await createAndSendOtp(email, purpose);
    }

    return NextResponse.json({
      success: true,
      message: 'If the address is eligible, a verification code has been sent.',
    }, { status: 200 });
  } catch (error: unknown) {
    const message = sanitizeAuthError(error, 'Failed to send OTP');
    return NextResponse.json({
      success: false,
      message,
    }, { status: 400 });
  }
}
