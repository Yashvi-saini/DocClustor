import { prisma } from '../db/prisma';
import { DocumentUploadPayload, WorkspaceContext } from '../types/api.types';
import { OrgRole, DocVisibility } from '@prisma/client';

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
  const visibilityConditions: { visibility: DocVisibility; uploadedById?: string }[] = [];

  // Visibility: OWNER/ADMIN see all except other members' PRIVATE files
  if (memberRole === OrgRole.OWNER || memberRole === OrgRole.ADMIN) {
    visibilityConditions.push(
      { visibility: DocVisibility.SHARED },
      { visibility: DocVisibility.ADMIN_ONLY },
      { visibility: DocVisibility.PRIVATE, uploadedById: userId }
    );
  } else {
    visibilityConditions.push(
      { visibility: DocVisibility.SHARED },
      { visibility: DocVisibility.PRIVATE, uploadedById: userId },
      { visibility: DocVisibility.ADMIN_ONLY, uploadedById: userId }
    );
  }

  return prisma.document.findMany({
    where: {
      orgId,
      userId: null,
      OR: visibilityConditions,
    },
    select: selectFields,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createDocument(
  workspaceContext: WorkspaceContext,
  data: DocumentUploadPayload & { fileSize?: number; mimeType?: string; fileUrl?: string }
) {
  if (workspaceContext.type === 'personal') {
    return prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        userId: workspaceContext.userId,
        orgId: null,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType,
        visibility: DocVisibility.SHARED,
      },
    });
  }

  const { orgId, userId } = workspaceContext;
  return prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      orgId,
      userId: null,
      uploadedById: userId,
      visibility: data.visibility || DocVisibility.SHARED,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || 0,
      mimeType: data.mimeType,
    },
  });
}

export async function deleteDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    throw new Error('Document not found');
  }

  if (workspaceContext.type === 'personal') {
    if (doc.userId !== workspaceContext.userId) {
      throw new Error('Unauthorized: You do not own this document');
    }
  } else {
    const { orgId, userId, memberRole } = workspaceContext;

    if (doc.orgId !== orgId) {
      throw new Error('Unauthorized: Document is not in this organization');
    }

    const isUploader = doc.uploadedById === userId;
    const isAdminOrOwner = memberRole === OrgRole.OWNER || memberRole === OrgRole.ADMIN;
    const isDeletableByAdmin = isAdminOrOwner && doc.visibility !== DocVisibility.PRIVATE;

    if (!isUploader && !isDeletableByAdmin) {
      throw new Error('Unauthorized: You do not have permissions to delete this document');
    }
  }

  return prisma.document.delete({
    where: { id: documentId },
  });
}
