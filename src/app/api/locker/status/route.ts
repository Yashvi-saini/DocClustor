import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getLocker } from '@backend/services/locker.service';

// GET /api/locker/status
export async function GET(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const locker = await getLocker(workspaceContext);

    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    const cookieName = `locker_session_${workspaceId}`;
    const isSessionUnlocked = request.cookies.get(cookieName)?.value === 'unlocked';

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
