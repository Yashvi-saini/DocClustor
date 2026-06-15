import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../db/prisma';
import { requireAuth } from './auth.middleware';
import { WorkspaceContext } from '../types/api.types';


export async function requireWorkspace(request: NextRequest): Promise<WorkspaceContext> {
  // 1. Authenticate user via JWT (throws 401 if missing/invalid)
  const jwt = await requireAuth(request);
  const userId = jwt.userId;

  // 2. Extract workspace context header

  const workspaceHeader = request.headers.get('X-Workspace-Context');

  // Default to personal workspace if no header is present
  if (!workspaceHeader || workspaceHeader === 'personal') {
    return {
      type: 'personal',
      userId,
    };
  }

  if (workspaceHeader.startsWith('org:')) {
    const orgId = workspaceHeader.split(':')[1];
    if (!orgId) {
      const err = new Error('Invalid workspace organization header format');
      (err as any).status = 400;
      throw err;
    }

    // S2: Hardened database cross-reference check
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      const err = new Error('Access Denied. You are not a member of this workspace.');
      (err as any).status = 403;
      throw err;
    }

    return {
      type: 'org',
      orgId,
      userId,
      memberRole: membership.role,
    };
  }

  const err = new Error('Unsupported workspace context header');
  (err as any).status = 400;
  throw err;
}

export function handleWorkspaceError(error: any) {
  const status = error.status || 500;
  const message = error.message || 'An unexpected server error occurred';
  
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}
