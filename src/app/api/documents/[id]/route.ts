import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { prisma } from '@backend/db/prisma';
import { canAccessDocument } from '@backend/services/document.service';
import { isLockerUnlocked, workspaceIdOf } from '@backend/utils/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const workspaceContext = await requireWorkspace(request);

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        content: true, userId: true, orgId: true, lockerId: true,
        uploadedById: true, visibility: true,
      },
    });

    if (!doc || !canAccessDocument(workspaceContext, doc)) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    if (doc.lockerId !== null) {
      const unlocked = await isLockerUnlocked(
        request,
        workspaceContext.userId,
        workspaceIdOf(workspaceContext)
      );
      if (!unlocked) {
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
