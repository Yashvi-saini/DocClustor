import { prisma } from '../db/prisma';
import { OrgCreatePayload, WorkspaceListItem } from '../types/api.types';
import { OrgRole } from '@prisma/client';

export async function createOrganisation(
  userId: string,
  data: OrgCreatePayload
) {
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  return await prisma.$transaction(async (tx) => {
    const org = await tx.organisation.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        cin: data.cin,
        gstin: data.gstin,
        industry: data.industry,
        logo: data.logo,
      },
    });

    await tx.orgMembership.create({
      data: {
        userId,
        orgId: org.id,
        role: OrgRole.OWNER,
      },
    });

    return org;
  }, {
    maxWait: 15000, // Wait up to 15 seconds to acquire a connection from the pool
    timeout: 30000  // Allow up to 30 seconds for transaction execution
  });
}

export async function listWorkspaces(userId: string): Promise<WorkspaceListItem[]> {
  const workspaces: WorkspaceListItem[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, avatar: true },
  });

  if (user) {
    workspaces.push({
      type: 'personal',
      id: userId,
      name: `${user.name || 'Personal'} Space`,
      logo: user.avatar,
    });
  }

  const memberships = await prisma.orgMembership.findMany({
    where: { userId },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  });

  memberships.forEach((m) => {
    workspaces.push({
      type: 'org',
      id: m.org.id,
      name: m.org.name,
      logo: m.org.logo,
      role: m.role,
    });
  });

  return workspaces;
}

export async function inviteToOrganisation(
  inviterId: string,
  orgId: string,
  targetEmail: string,
  role: OrgRole
) {
  const inviterMembership = await prisma.orgMembership.findUnique({
    where: {
      userId_orgId: {
        userId: inviterId,
        orgId,
      },
    },
  });

  if (!inviterMembership || (inviterMembership.role !== OrgRole.OWNER && inviterMembership.role !== OrgRole.ADMIN)) {
    throw new Error('Forbidden: Only organization owners and admins can invite members.');
  }

  let targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email: targetEmail,
        emailVerified: false,
        profileComplete: false,
      },
    });
  }

  const existingMembership = await prisma.orgMembership.findUnique({
    where: {
      userId_orgId: {
        userId: targetUser.id,
        orgId,
      },
    },
  });

  if (existingMembership) {
    throw new Error('User is already a member of this organization.');
  }

  return await prisma.orgMembership.create({
    data: {
      userId: targetUser.id,
      orgId,
      role,
    },
  });
}
