import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getDocuments, createDocument, deleteDocument } from '@backend/services/document.service';

//GET /api/documents 
export async function GET(request: NextRequest) {
  try {
   
    const workspaceContext = await requireWorkspace(request);
    const documents = await getDocuments(workspaceContext);

    const workspaceId = workspaceContext.type === 'personal'
      ? workspaceContext.userId
      : workspaceContext.orgId;
    const cookieName = `locker_session_${workspaceId}`;
    const isSessionUnlocked = request.cookies.get(cookieName)?.value === 'unlocked';

    const securedDocuments = documents.map(doc => {
      if (doc.lockerId !== null && !isSessionUnlocked) {
        return {
          ...doc,
          content: "[LOCKED]",
          fileUrl: null,
        };
      }
      return doc;
    });

    return NextResponse.json({
      success: true,
      message: 'Documents fetched successfully',
      data: { documents: securedDocuments },
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// ── POST /api/documents
export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const document = await createDocument(workspaceContext, {
      title: body.title,
      content: body.content,
      type: body.type || 'TEXT',
      visibility: body.visibility, // SHARED | PRIVATE | ADMIN_ONLY
      fileSize: body.fileSize,
      mimeType: body.mimeType,
    });

    return NextResponse.json(
      { success: true, message: 'Document created successfully', data: { document } },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// DELETE /api/documents
export async function DELETE(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    await deleteDocument(workspaceContext, documentId);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
