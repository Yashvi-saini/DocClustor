import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { clearLockerSession, workspaceIdOf } from '@backend/utils/session';

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);

    const response = NextResponse.json({
      success: true,
      message: 'Locker locked successfully',
    });
    clearLockerSession(response, workspaceIdOf(workspaceContext));
    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
