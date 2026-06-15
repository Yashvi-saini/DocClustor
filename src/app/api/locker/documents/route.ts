import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getLocker, lockDocument, unlockDocument } from '@backend/services/locker.service';


 // Helper to check if the locker session is currently unlocked.

function verifySessionUnlocked(request: NextRequest, workspaceId: string): boolean {
  const cookieName = `locker_session_${workspaceId}`;
  return request.cookies.get(cookieName)?.value === 'unlocked';
}

// GET /api/locker/documents
export async function GET(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;

    if (!verifySessionUnlocked(request, workspaceId)) {
      return NextResponse.json(
        { success: false, message: 'Locker is locked. Please unlock first.' },
        { status: 403 }
      );
    }

    const locker = await getLocker(workspaceContext);
    const documents = locker ? locker.documents : [];

    return NextResponse.json({
      success: true,
      message: 'Locked documents retrieved',
      data: { documents },
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// POST /api/locker/documents
// Move a standard document into the locker.
export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();
    const { documentId } = body;

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'documentId is required' },
        { status: 400 }
      );
    }

    await lockDocument(workspaceContext, documentId);

    return NextResponse.json({
      success: true,
      message: 'Document moved into locker',
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// DELETE /api/locker/documents
export async function DELETE(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'documentId query parameter is required' },
        { status: 400 }
      );
    }

    await unlockDocument(workspaceContext, documentId);

    return NextResponse.json({
      success: true,
      message: 'Document removed from locker',
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
