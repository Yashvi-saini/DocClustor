import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
import { prisma } from '@backend/db/prisma';
import { MembershipStatus } from '@prisma/client';

// GET /api/workspaces/invitations
// Retrieve all pending organization invitations for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const jwt = await requireAuth(request);
    const userId = jwt.userId;

    const pendingMemberships = await prisma.orgMembership.findMany({
      where: {
        userId,
        status: MembershipStatus.PENDING,
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        invitations: pendingMemberships.map(m => ({
          orgId: m.org.id,
          name: m.org.name,
          logo: m.org.logo,
          industry: m.org.industry,
          role: m.role,
          invitedAt: m.joinedAt,
        }))
      }
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
