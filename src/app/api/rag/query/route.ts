import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { queryRag } from '@backend/services/rag.service';

// POST /api/rag/query

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();

    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { success: false, message: 'A question string is required' },
        { status: 400 }
      );
    }

    const result = await queryRag({
      question: body.question,
      workspaceContext,
    });

    return NextResponse.json({
      success: true,
      message: 'Query processed',
      data: result,
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
