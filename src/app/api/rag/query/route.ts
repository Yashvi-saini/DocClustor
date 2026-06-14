// ─── POST /api/rag/query ───────────────────────────────────────────────────────
//
// The main RAG (AI chat) endpoint.
// User sends a question → we find relevant documents → AI answers based on them.
// Protected: must be logged in.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
import { queryRag } from '@backend/services/rag.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { success: false, message: 'A question string is required' },
        { status: 400 }
      );
    }

    const result = await queryRag({
      question: body.question,
      userId: user.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Query processed',
      data: result,
    });
  } catch {
    return unauthorized();
  }
}
