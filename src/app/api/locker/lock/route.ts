import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';

///api/locker/lock
export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    const cookieName = `locker_session_${workspaceId}`;
    const response = NextResponse.json({
      success: true,
      message: 'Locker locked successfully',
    });

    // Clear the cookie
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
