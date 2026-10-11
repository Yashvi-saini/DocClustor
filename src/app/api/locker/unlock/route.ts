import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { verifyLockerPin } from '@backend/services/locker.service';
import { setLockerSession, workspaceIdOf } from '@backend/utils/session';
import { rateLimit } from '@backend/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: 'Locker PIN is required' },
        { status: 400 }
      );
    }

    const limited = rateLimit(`locker-unlock:${workspaceContext.userId}`, 20, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    await verifyLockerPin(workspaceContext, pin);

    const response = NextResponse.json({
      success: true,
      message: 'Locker unlocked successfully',
    });
    await setLockerSession(response, workspaceContext.userId, workspaceIdOf(workspaceContext));
    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
