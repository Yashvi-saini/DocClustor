import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { verifyOtpInDb } from '@backend/services/otp.service';
import { resetLockerPin } from '@backend/services/locker.service';
import { prisma } from '@backend/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { otp, pin } = body;

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ success: false, message: 'OTP is required' }, { status: 400 });
    }

    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ success: false, message: 'PIN must be a numeric string between 4 and 6 digits' }, { status: 400 });
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

    // Reset the locker PIN and clear lockout state
    await resetLockerPin(workspaceContext, pin);

    // Set the transient session cookie to automatically unlock
    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    const cookieName = `locker_session_${workspaceId}`;
    const response = NextResponse.json({
      success: true,
      message: 'PIN reset successfully, locker unlocked',
    });

    response.cookies.set(cookieName, 'unlocked', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
