import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { createAndSendOtp } from '@backend/services/otp.service';
import { prisma } from '@backend/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const user = await prisma.user.findUnique({
      where: { id: workspaceContext.userId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ success: false, message: 'User email not found' }, { status: 404 });
    }

    await createAndSendOtp(user.email, 'reset_locker_pin');

    return NextResponse.json({
      success: true,
      message: 'Verification OTP sent to your registered email.',
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
