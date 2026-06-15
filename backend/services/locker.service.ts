import { prisma } from '../db/prisma';
import { WorkspaceContext } from '../types/api.types';
import { generateSalt, derivePinHash } from '../utils/encryption';

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
        },
      },
    },
  });
}

export async function createLocker(workspaceContext: WorkspaceContext, pin: string) {
  const existing = await getLocker(workspaceContext);
  if (existing) {
    throw new Error('A locker is already initialized for this workspace.');
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
    throw new Error('Locker has not been set up yet.');
  }

  const now = new Date();

  // Rate limiting lockout check
  if (locker.lockedUntil && locker.lockedUntil > now) {
    const diffMs = locker.lockedUntil.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    throw new Error(`Locker is locked due to multiple incorrect attempts. Try again in ${diffMins} minutes.`);
  }

  const derivedHash = await derivePinHash(pin, locker.pinSalt);

  if (derivedHash === locker.pinHash) {
    await prisma.locker.update({
      where: { id: locker.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    return true;
  }

  const nextAttempts = locker.failedAttempts + 1;
  const dataToUpdate: { failedAttempts: number; lockedUntil?: Date | null } = {
    failedAttempts: nextAttempts,
  };

  if (nextAttempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
    dataToUpdate.lockedUntil = lockedUntil;
    
    await prisma.locker.update({
      where: { id: locker.id },
      data: dataToUpdate,
    });
    throw new Error(`Too many incorrect attempts. Locker locked for ${LOCKOUT_MINUTES} minutes.`);
  }

  await prisma.locker.update({
    where: { id: locker.id },
    data: dataToUpdate,
  });

  const remaining = MAX_ATTEMPTS - nextAttempts;
  throw new Error(`Incorrect PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
}

export async function lockDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const locker = await getLocker(workspaceContext);
  if (!locker) {
    throw new Error('Locker must be set up first.');
  }

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    throw new Error('Document not found.');
  }

  if (workspaceContext.type === 'personal') {
    if (doc.userId !== workspaceContext.userId) {
      throw new Error('Unauthorized: Document does not belong to your personal workspace.');
    }
  } else {
    if (doc.orgId !== workspaceContext.orgId) {
      throw new Error('Unauthorized: Document does not belong to this organization workspace.');
    }
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      lockerId: locker.id,
    },
  });
}

export async function unlockDocument(workspaceContext: WorkspaceContext, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc || doc.lockerId === null) {
    throw new Error('Document is not locked.');
  }

  if (workspaceContext.type === 'personal') {
    if (doc.userId !== workspaceContext.userId) {
      throw new Error('Unauthorized');
    }
  } else {
    if (doc.orgId !== workspaceContext.orgId) {
      throw new Error('Unauthorized');
    }
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      lockerId: null,
    },
  });
}
