import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { WorkspaceContext } from '../types/api.types';
import { generateSalt, derivePinHash } from '../utils/encryption';
import { canAccessDocument, isOrgAdmin, HttpError } from './document.service';

const LOCKOUT_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export async function getLocker(workspaceContext: WorkspaceContext) {
  const whereClause = workspaceContext.type === 'personal'
    ? { userId: workspaceContext.userId, orgId: null }
    : { orgId: workspaceContext.orgId, userId: null };

  return prisma.locker.findFirst({
    where: whereClause,
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          type: true,
          fileUrl: true,
          fileSize: true,
          createdAt: true,
          userId: true,
          orgId: true,
          uploadedById: true,
          visibility: true,
        },
      },
    },
  });
}

export function assertCanManageLocker(workspaceContext: WorkspaceContext) {
  if (workspaceContext.type === 'org' && !isOrgAdmin(workspaceContext.memberRole)) {
    throw new HttpError('Forbidden: Only organization owners and admins can manage the locker PIN.', 403);
  }
}

export async function createLocker(workspaceContext: WorkspaceContext, pin: string) {
  assertCanManageLocker(workspaceContext);

  const existing = await getLocker(workspaceContext);
  if (existing) {
    throw new HttpError('A locker is already initialized for this workspace.', 409);
  }

  const salt = generateSalt(32);
  const pinHash = await derivePinHash(pin, salt);

  const dataClause = workspaceContext.type === 'personal'
    ? { name: 'Personal Locker', pinHash, pinSalt: salt, userId: workspaceContext.userId }
    : { name: 'Organization Locker', pinHash, pinSalt: salt, orgId: workspaceContext.orgId };

  return prisma.locker.create({
    data: dataClause,
  });
}

export async function verifyLockerPin(workspaceContext: WorkspaceContext, pin: string): Promise<boolean> {
  const locker = await getLocker(workspaceContext);
  if (!locker) {
    throw new HttpError('Locker has not been set up yet.', 400);
  }

  const now = new Date();

  if (locker.lockedUntil && locker.lockedUntil > now) {
    const diffMins = Math.ceil((locker.lockedUntil.getTime() - now.getTime()) / (1000 * 60));
    throw new HttpError(`Locker is locked due to multiple incorrect attempts. Try again in ${diffMins} minutes.`, 423);
  }

  const derivedHash = await derivePinHash(pin, locker.pinSalt);

  const a = Buffer.from(derivedHash, 'hex');
  const b = Buffer.from(locker.pinHash, 'hex');
  const matches = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (matches) {
    await prisma.locker.update({
      where: { id: locker.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    return true;
  }

  const updated = await prisma.locker.update({
    where: { id: locker.id },
    data: { failedAttempts: { increment: 1 } },
    select: { failedAttempts: true },
  });

  if (updated.failedAttempts >= MAX_ATTEMPTS) {
    await prisma.locker.update({
      where: { id: locker.id },
      data: {
        lockedUntil: new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000),
        failedAttempts: 0,
      },
    });
    throw new HttpError(`Too many incorrect attempts. Locker locked for ${LOCKOUT_MINUTES} minutes.`, 423);
  }

  const remaining = MAX_ATTEMPTS - updated.failedAttempts;
  throw new HttpError(`Incorrect PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 400);
}

async function loadManageableDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true, userId: true, orgId: true, uploadedById: true, visibility: true, lockerId: true,
    },
  });

  if (!doc || !canAccessDocument(workspaceContext, doc)) {
    throw new HttpError('Document not found.', 404);
  }

  if (workspaceContext.type === 'org') {
    const isUploader = doc.uploadedById === workspaceContext.userId;
    if (!isUploader && !isOrgAdmin(workspaceContext.memberRole)) {
      throw new HttpError('Forbidden: Only the uploader or an admin can move this document in or out of the locker.', 403);
    }
  }
  return doc;
}

export async function lockDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const locker = await getLocker(workspaceContext);
  if (!locker) {
    throw new HttpError('Locker must be set up first.', 400);
  }

  await loadManageableDocument(workspaceContext, documentId);

  return prisma.document.update({
    where: { id: documentId },
    data: { lockerId: locker.id },
  });
}

export async function unlockDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const doc = await loadManageableDocument(workspaceContext, documentId);

  if (doc.lockerId === null) {
    throw new HttpError('Document is not locked.', 400);
  }

  return prisma.document.update({
    where: { id: documentId },
    data: { lockerId: null },
  });
}

export async function resetLockerPin(workspaceContext: WorkspaceContext, pin: string) {
  assertCanManageLocker(workspaceContext);

  const locker = await getLocker(workspaceContext);
  if (!locker) {
    throw new HttpError('Locker has not been set up yet.', 400);
  }

  const salt = generateSalt(32);
  const pinHash = await derivePinHash(pin, salt);

  return prisma.locker.update({
    where: { id: locker.id },
    data: {
      pinHash,
      pinSalt: salt,
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
}
