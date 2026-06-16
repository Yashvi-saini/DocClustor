import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { queryRag } from '@backend/services/rag.service';
import { listWorkspaces } from '@backend/services/workspace.service';

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

    const userId = workspaceContext.userId;
    const searchAllWorkspaces = body.searchAllWorkspaces === true;
    const unlockedWorkspaceIds: string[] = [];

    // Check cookies to determine which locker sessions are unlocked
    if (searchAllWorkspaces) {
      const workspaces = await listWorkspaces(userId);
      for (const w of workspaces) {
        const cookieName = `locker_session_${w.id}`;
        if (request.cookies.get(cookieName)?.value === 'unlocked') {
          unlockedWorkspaceIds.push(w.id);
        }
      }
    } else {
      const activeId = workspaceContext.type === 'personal'
        ? workspaceContext.userId
        : workspaceContext.orgId;
      const cookieName = `locker_session_${activeId}`;
      if (request.cookies.get(cookieName)?.value === 'unlocked') {
        unlockedWorkspaceIds.push(activeId);
      }
    }

    const result = await queryRag({
      question: body.question,
      workspaceContext,
      searchAllWorkspaces,
      unlockedWorkspaceIds,
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
