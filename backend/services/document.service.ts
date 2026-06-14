// ─── Document Service (Server-Side) ───────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// All document-related database logic lives here.
// Called by /api/documents route handlers.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '../db/prisma';
import { DocumentUploadPayload } from '../types/api.types';

// ── Get all documents for a user ─────────────────────────────────────────────
export async function getDocumentsByUserId(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ── Create a new document ─────────────────────────────────────────────────────
export async function createDocument(userId: string, data: DocumentUploadPayload) {
  return prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      userId,
    },
  });
}

// ── Delete a document ─────────────────────────────────────────────────────────
export async function deleteDocument(documentId: string, userId: string) {
  // We always pass userId to ensure users can only delete THEIR OWN documents
  return prisma.document.delete({
    where: { id: documentId, userId },
  });
}
