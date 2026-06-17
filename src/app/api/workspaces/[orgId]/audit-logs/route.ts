import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { prisma } from '@backend/db/prisma';
import { OrgRole } from '@prisma/client';

// GET /api/workspaces/[orgId]/audit-logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const workspaceContext = await requireWorkspace(request);

    if (workspaceContext.type !== 'org' || workspaceContext.orgId !== orgId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this organization workspace' },
        { status: 403 }
      );
    }

    // Role check: Only OWNER or ADMIN can view audit logs
    const callerRole = workspaceContext.memberRole;
    if (callerRole !== OrgRole.OWNER && callerRole !== OrgRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only organization owners and admins can view audit logs' },
        { status: 403 }
      );
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to most recent 100 entries for performance
    });

    return NextResponse.json({
      success: true,
      data: {
        auditLogs: auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          targetId: log.targetId,
          metadata: log.metadata,
          ip: log.ip,
          createdAt: log.createdAt,
          actor: {
            name: log.user.name || 'Invited User',
            email: log.user.email,
          }
        }))
      }
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
