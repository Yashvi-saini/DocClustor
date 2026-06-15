import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { prisma } from '@backend/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const workspaceContext = await requireWorkspace(request);

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { content: true, userId: true, orgId: true, lockerId: true },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    // Access check
    if (workspaceContext.type === 'personal') {
      if (doc.userId !== workspaceContext.userId || doc.orgId !== null) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      if (doc.orgId !== workspaceContext.orgId) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Security check: if the document is locked, verify locker session is unlocked
    if (doc.lockerId !== null) {
      const workspaceId = workspaceContext.type === 'personal'
        ? workspaceContext.userId
        : workspaceContext.orgId;
      const cookieName = `locker_session_${workspaceId}`;
      const isSessionUnlocked = request.cookies.get(cookieName)?.value === 'unlocked';
      if (!isSessionUnlocked) {
        return NextResponse.json(
          { success: false, message: 'Locker session is locked. Please unlock first.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { content: doc.content },
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
