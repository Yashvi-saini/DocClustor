import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace } from '@backend/middleware/workspace';
import { verifyLockerPin } from '@backend/services/locker.service';

//POST /api/locker/unlock

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Locker PIN is required' },
        { status: 400 }
      );
    }

    // This checks for brute-force lockouts and verifies PIN
    await verifyLockerPin(workspaceContext, pin);

    // Set the transient session cookie
    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    const cookieName = `locker_session_${workspaceId}`;
    const response = NextResponse.json({
      success: true,
      message: 'Locker unlocked successfully',
    });

    response.cookies.set(cookieName, 'unlocked', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unlock failed';
    // If verifyLockerPin throws error (e.g. lockout or incorrect pin), return it
    if (message.includes('Too many incorrect attempts') || message.includes('locked')) {
      return NextResponse.json(
        { success: false, message },
        { status: 423 } // 423 Locked
      );
    }
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
