import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getLocker } from '@backend/services/locker.service';
import { isLockerUnlocked, workspaceIdOf } from '@backend/utils/session';

export async function GET(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const locker = await getLocker(workspaceContext);

    const isSessionUnlocked = await isLockerUnlocked(
      request,
      workspaceContext.userId,
      workspaceIdOf(workspaceContext)
    );

    if (!locker) {
      return NextResponse.json({
        success: true,
        data: {
          hasLocker: false,
          isLocked: false,
          lockedUntil: null,
          isSessionUnlocked: false,
        },
      });
    }

    const now = new Date();
    const isLocked = !!(locker.lockedUntil && locker.lockedUntil > now);

    return NextResponse.json({
      success: true,
      data: {
        hasLocker: true,
        isLocked,
        lockedUntil: locker.lockedUntil,
        isSessionUnlocked,
      },
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
