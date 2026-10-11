import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { verifyOtpInDb } from '@backend/services/otp.service';
import { resetLockerPin, assertCanManageLocker } from '@backend/services/locker.service';
import { setLockerSession, workspaceIdOf } from '@backend/utils/session';
import { rateLimit } from '@backend/utils/rate-limit';
import { prisma } from '@backend/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    assertCanManageLocker(workspaceContext);

    const body = await request.json();
    const { otp, pin } = body;

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ success: false, message: 'OTP is required' }, { status: 400 });
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ success: false, message: 'PIN must be a numeric string between 4 and 6 digits' }, { status: 400 });
    }

    const limited = rateLimit(`locker-reset:${workspaceContext.userId}`, 10, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: workspaceContext.userId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ success: false, message: 'User email not found' }, { status: 404 });
    }

    const isValid = await verifyOtpInDb(user.email, otp, 'reset_locker_pin');
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    await resetLockerPin(workspaceContext, pin);

    const response = NextResponse.json({
      success: true,
      message: 'PIN reset successfully, locker unlocked',
    });
    await setLockerSession(response, workspaceContext.userId, workspaceIdOf(workspaceContext));
    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
