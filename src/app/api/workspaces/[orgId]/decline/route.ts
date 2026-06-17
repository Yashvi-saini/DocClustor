import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
import { prisma } from '@backend/db/prisma';
import { MembershipStatus } from '@prisma/client';

// POST /api/workspaces/[orgId]/decline
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
        { success: false, message: 'Cannot decline an already active membership. Use leave instead.' },
        { status: 400 }
      );
    }

    // Delete membership (decline invitation)
    await prisma.orgMembership.delete({
      where: {
        userId_orgId: {
          userId,
          orgId,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation declined.'
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
