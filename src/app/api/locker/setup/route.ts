import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { createLocker } from '@backend/services/locker.service';

// ─── POST /api/locker/setup
export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { pin } = body;

    // Validate PIN (must be 4 to 6 digit string)
    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: 'PIN must be a numeric string between 4 and 6 digits' },
        { status: 400 }
      );
    }

    const locker = await createLocker(workspaceContext, pin);

    // Auto-unlock the session upon setup
    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    const cookieName = `locker_session_${workspaceId}`;
    const response = NextResponse.json({
      success: true,
      message: 'Locker initialized and unlocked successfully',
      data: { lockerId: locker.id },
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
