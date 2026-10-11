import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { createLocker } from '@backend/services/locker.service';
import { setLockerSession, workspaceIdOf } from '@backend/utils/session';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: 'PIN must be a numeric string between 4 and 6 digits' },
        { status: 400 }
      );
    }

    const locker = await createLocker(workspaceContext, pin);

    const response = NextResponse.json({
      success: true,
      message: 'Locker initialized and unlocked successfully',
      data: { lockerId: locker.id },
    });
    await setLockerSession(response, workspaceContext.userId, workspaceIdOf(workspaceContext));
    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
