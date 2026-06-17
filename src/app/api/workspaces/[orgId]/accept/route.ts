import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
import { prisma } from '@backend/db/prisma';
import { MembershipStatus } from '@prisma/client';

// POST /api/workspaces/[orgId]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const jwt = await requireAuth(request);
    const userId = jwt.userId;

    // Verify invitation exists
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, message: 'No invitation found for this organization.' },
        { status: 404 }
      );
    }

    if (membership.status === MembershipStatus.ACTIVE) {
      return NextResponse.json(
        { success: true, message: 'Invitation already accepted.' }
      );
    }

    // Accept invitation
    await prisma.orgMembership.update({
      where: {
        userId_orgId: {
          userId,
          orgId,
        }
      },
      data: {
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'ACCEPT_INVITATION',
        targetId: orgId,
        metadata: { role: membership.role },
        userId,
        orgId,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully. Welcome to the workspace!'
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
