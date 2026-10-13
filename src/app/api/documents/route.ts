import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { getDocuments, createDocument, deleteDocument } from '@backend/services/document.service';
import { indexDocument } from '@backend/rag/indexer';
import { isLockerUnlocked, workspaceIdOf } from '@backend/utils/session';
import { rateLimit } from '@backend/utils/rate-limit';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const documents = await getDocuments(workspaceContext);

    const isSessionUnlocked = await isLockerUnlocked(
      request,
      workspaceContext.userId,
      workspaceIdOf(workspaceContext)
    );

    const securedDocuments = documents.map(doc => {
      if (doc.lockerId !== null && !isSessionUnlocked) {
        return {
          ...doc,
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

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);

    const limited = rateLimit(`doc-upload:${workspaceContext.userId}`, 30, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many uploads. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

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
      visibility: body.visibility,
      mimeType: body.mimeType,
    });

    let indexed = false;
    try {
      indexed = await indexDocument(document.id);
    } catch (err) {
      console.error('[RAG] Indexing at upload failed:', err instanceof Error ? err.message : err);
    }

    const { content: _content, ...safeDocument } = document;
    void _content;

    return NextResponse.json(
      { success: true, message: 'Document created successfully', data: { document: safeDocument, indexed } },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

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

    const lockerUnlocked = await isLockerUnlocked(
      request,
      workspaceContext.userId,
      workspaceIdOf(workspaceContext)
    );

    await deleteDocument(workspaceContext, documentId, lockerUnlocked);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
