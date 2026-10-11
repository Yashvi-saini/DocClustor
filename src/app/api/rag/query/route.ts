import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { queryRag } from '@backend/services/rag.service';
import { listWorkspaces } from '@backend/services/workspace.service';
import { isLockerUnlocked, workspaceIdOf } from '@backend/utils/session';
import { rateLimit } from '@backend/utils/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_QUESTION_CHARS = 2000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 1500;

export async function POST(request: NextRequest) {
  try {
    const workspaceContext = await requireWorkspace(request);
    const body = await request.json();

    if (!body.question || typeof body.question !== 'string' || !body.question.trim()) {
      return NextResponse.json(
        { success: false, message: 'A question string is required' },
        { status: 400 }
      );
    }
    if (body.question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json(
        { success: false, message: `Question must be at most ${MAX_QUESTION_CHARS} characters` },
        { status: 400 }
      );
    }

    const limited = rateLimit(`rag:${workspaceContext.userId}`, 30, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many questions. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const userId = workspaceContext.userId;
    const searchAllWorkspaces = body.searchAllWorkspaces === true;

    const history = Array.isArray(body.history)
      ? body.history
          .filter((t: unknown): t is { role: 'user' | 'assistant'; content: string } =>
            !!t && typeof t === 'object' &&
            ((t as { role?: unknown }).role === 'user' || (t as { role?: unknown }).role === 'assistant') &&
            typeof (t as { content?: unknown }).content === 'string')
          .slice(-MAX_HISTORY_TURNS)
          .map((t: { role: 'user' | 'assistant'; content: string }) => ({
            role: t.role,
            content: t.content.slice(0, MAX_HISTORY_CHARS),
          }))
      : [];

    const unlockedWorkspaceIds: string[] = [];
    if (searchAllWorkspaces) {
      const workspaces = await listWorkspaces(userId);
      for (const w of workspaces) {
        if (await isLockerUnlocked(request, userId, w.id)) unlockedWorkspaceIds.push(w.id);
      }
    } else {
      const activeId = workspaceIdOf(workspaceContext);
      if (await isLockerUnlocked(request, userId, activeId)) unlockedWorkspaceIds.push(activeId);
    }

    const result = await queryRag({
      question: body.question,
      workspaceContext,
      searchAllWorkspaces,
      unlockedWorkspaceIds,
      history,
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
