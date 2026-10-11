import { prisma } from '../db/prisma';
import { DocumentUploadPayload, WorkspaceContext } from '../types/api.types';
import { OrgRole, DocVisibility, DocType } from '@prisma/client';
import { removeDocumentVectors } from '../rag/indexer';

export const MAX_DOCUMENT_CONTENT_CHARS = 7_000_000;
export const MAX_TITLE_LENGTH = 255;

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function orgVisibilityConditions(userId: string, memberRole: string) {
  const conditions: { visibility: DocVisibility; uploadedById?: string }[] = [];

  if (memberRole === OrgRole.OWNER || memberRole === OrgRole.ADMIN) {
    conditions.push(
      { visibility: DocVisibility.SHARED },
      { visibility: DocVisibility.ADMIN_ONLY },
      { visibility: DocVisibility.PRIVATE, uploadedById: userId }
    );
  } else {
    conditions.push(
      { visibility: DocVisibility.SHARED },
      { visibility: DocVisibility.PRIVATE, uploadedById: userId },
      { visibility: DocVisibility.ADMIN_ONLY, uploadedById: userId }
    );
  }
  return conditions;
}

export function isOrgAdmin(role: string): boolean {
  return role === OrgRole.OWNER || role === OrgRole.ADMIN;
}

export function canAccessDocument(
  ctx: WorkspaceContext,
  doc: { userId: string | null; orgId: string | null; uploadedById: string | null; visibility: DocVisibility }
): boolean {
  if (ctx.type === 'personal') {
    return doc.userId === ctx.userId && doc.orgId === null;
  }
  if (doc.orgId !== ctx.orgId || doc.userId !== null) return false;

  if (doc.visibility === DocVisibility.SHARED) return true;
  if (doc.visibility === DocVisibility.ADMIN_ONLY && isOrgAdmin(ctx.memberRole)) return true;
  if (doc.uploadedById === ctx.userId) return true;
  return false;
}

export async function getDocuments(workspaceContext: WorkspaceContext, includeContent = false) {
  const selectFields = {
    id: true,
    title: true,
    type: true,
    isEncrypted: true,
    vectorId: true,
    source: true,
    fileUrl: true,
    fileSize: true,
    mimeType: true,
    userId: true,
    orgId: true,
    lockerId: true,
    uploadedById: true,
    visibility: true,
    createdAt: true,
    updatedAt: true,
    ...(includeContent ? { content: true } : {}),
  };

  if (workspaceContext.type === 'personal') {
    return prisma.document.findMany({
      where: {
        userId: workspaceContext.userId,
        orgId: null,
      },
      select: selectFields,
      orderBy: { createdAt: 'desc' },
    });
  }

  const { orgId, userId, memberRole } = workspaceContext;

  return prisma.document.findMany({
    where: {
      orgId,
      userId: null,
      OR: orgVisibilityConditions(userId, memberRole),
    },
    select: selectFields,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createDocument(
  workspaceContext: WorkspaceContext,
  data: DocumentUploadPayload & { fileSize?: number; mimeType?: string; fileUrl?: string }
) {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title || title.length > MAX_TITLE_LENGTH) {
    throw new HttpError(`Title is required and must be at most ${MAX_TITLE_LENGTH} characters`, 400);
  }
  if (typeof data.content !== 'string' || data.content.length === 0) {
    throw new HttpError('Document content is required', 400);
  }
  if (data.content.length > MAX_DOCUMENT_CONTENT_CHARS) {
    throw new HttpError('Document is too large (maximum 5 MB)', 413);
  }

  const type = (data.type || 'TEXT') as DocType;
  if (!Object.values(DocType).includes(type)) {
    throw new HttpError('Invalid document type', 400);
  }

  const mimeType =
    typeof data.mimeType === 'string' && /^[\w.+-]+\/[\w.+-]+$/.test(data.mimeType) ? data.mimeType : undefined;

  const fileSize = Buffer.byteLength(data.content, 'utf8');

  if (workspaceContext.type === 'personal') {
    return prisma.document.create({
      data: {
        title,
        content: data.content,
        type,
        userId: workspaceContext.userId,
        orgId: null,
        fileSize,
        mimeType,
        visibility: DocVisibility.SHARED,
      },
    });
  }

  const { orgId, userId, memberRole } = workspaceContext;

  if (memberRole === OrgRole.VIEWER) {
    throw new HttpError('Forbidden: Viewers cannot upload documents', 403);
  }

  const visibility = (data.visibility || DocVisibility.SHARED) as DocVisibility;
  if (!Object.values(DocVisibility).includes(visibility)) {
    throw new HttpError('Invalid visibility', 400);
  }
  if (visibility === DocVisibility.ADMIN_ONLY && !isOrgAdmin(memberRole)) {
    throw new HttpError('Forbidden: Only admins can create admin-only documents', 403);
  }

  return prisma.document.create({
    data: {
      title,
      content: data.content,
      type,
      orgId,
      userId: null,
      uploadedById: userId,
      visibility,
      fileSize,
      mimeType,
    },
  });
}

export async function deleteDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, userId: true, orgId: true, uploadedById: true, visibility: true, lockerId: true },
  });

  if (!doc) {
    throw new HttpError('Document not found', 404);
  }

  if (workspaceContext.type === 'personal') {
    if (doc.userId !== workspaceContext.userId) {
      throw new HttpError('Unauthorized: You do not own this document', 403);
    }
  } else {
    const { orgId, userId, memberRole } = workspaceContext;

    if (doc.orgId !== orgId) {
      throw new HttpError('Unauthorized: Document is not in this organization', 403);
    }

    const isUploader = doc.uploadedById === userId;
    const isDeletableByAdmin = isOrgAdmin(memberRole) && doc.visibility !== DocVisibility.PRIVATE;

    if (!isUploader && !isDeletableByAdmin) {
      throw new HttpError('Unauthorized: You do not have permissions to delete this document', 403);
    }
  }

  const deleted = await prisma.document.delete({
    where: { id: documentId },
  });

  await removeDocumentVectors(documentId).catch((err) =>
    console.error('[RAG] Failed to remove vectors for deleted document', documentId, err)
  );

  return deleted;
}
