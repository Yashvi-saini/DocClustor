// ─── GET + POST /api/documents ─────────────────────────────────────────────────
//
// GET  → Fetch all documents for the logged-in user
// POST → Upload/create a new document
//
// Both routes are protected — you must be logged in (valid JWT cookie) to use them.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
import { getDocumentsByUserId, createDocument } from '@backend/services/document.service';

// ── GET /api/documents ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await requireAuth(request);

    const documents = await getDocumentsByUserId(user.userId);

    return NextResponse.json({
      success: true,
      message: 'Documents fetched successfully',
      data: { documents },
    });
  } catch {
    return unauthorized();
  }
}

// ── POST /api/documents ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const document = await createDocument(user.userId, {
      title: body.title,
      content: body.content,
      type: body.type || 'TEXT',
    });

    return NextResponse.json(
      { success: true, message: 'Document created', data: { document } },
      { status: 201 }
    );
  } catch {
    return unauthorized();
  }
}
