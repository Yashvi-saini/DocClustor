import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getLocker, lockDocument, unlockDocument } from '@backend/services/locker.service';
import { canAccessDocument } from '@backend/services/document.service';
import { isLockerUnlocked, workspaceIdOf } from '@backend/utils/session';

export async function GET(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);

    if (!(await isLockerUnlocked(request, workspaceContext.userId, workspaceIdOf(workspaceContext)))) {
      return NextResponse.json(
        { success: false, message: 'Locker is locked. Please unlock first.' },
        { status: 403 }
      );
    }

    const locker = await getLocker(workspaceContext);
    const documents = (locker ? locker.documents : [])
      .filter((doc) => canAccessDocument(workspaceContext, doc))
      .map(({ id, title, type, fileUrl, fileSize, createdAt }) => ({
        id, title, type, fileUrl, fileSize, createdAt,
      }));

    return NextResponse.json({
      success: true,
      message: 'Locked documents retrieved',
      data: { documents },
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

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

    if (!(await isLockerUnlocked(request, workspaceContext.userId, workspaceIdOf(workspaceContext)))) {
      return NextResponse.json(
        { success: false, message: 'Locker is locked. Please unlock first.' },
        { status: 403 }
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
