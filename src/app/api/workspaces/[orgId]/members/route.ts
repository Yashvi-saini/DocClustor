import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { prisma } from '@backend/db/prisma';
import { OrgRole } from '@prisma/client';

// GET /api/workspaces/[orgId]/members
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

    const members = await prisma.orgMembership.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        members: members.map(m => ({
          membershipId: m.id,
          userId: m.user.id,
          name: m.user.name || 'Invited User',
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
        }))
      }
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// PATCH /api/workspaces/[orgId]/members
// Update a member's role
export async function PATCH(
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

    const { userId: targetUserId, role: newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { success: false, message: 'Target user ID and new role are required' },
        { status: 400 }
      );
    }

    if (!Object.values(OrgRole).includes(newRole)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Role check: Only OWNER or ADMIN can change roles
    const callerRole = workspaceContext.memberRole;
    if (callerRole !== OrgRole.OWNER && callerRole !== OrgRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only organization owners and admins can update member roles' },
        { status: 403 }
      );
    }

    // Get the target membership
    const targetMembership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: targetUserId,
          orgId,
        }
      }
    });

    if (!targetMembership) {
      return NextResponse.json(
        { success: false, message: 'Target user is not a member of this organization' },
        { status: 404 }
      );
    }

    // Protection logic:
    // 1. Cannot change OWNER's role
    if (targetMembership.role === OrgRole.OWNER) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify the role of the organization owner' },
        { status: 403 }
      );
    }

    // 2. ADMINs cannot change other ADMINs' roles, nor can they change anyone to OWNER
    if (callerRole === OrgRole.ADMIN) {
      if (targetMembership.role === OrgRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: 'ADMINs cannot modify other ADMINs\' roles' },
          { status: 403 }
        );
      }
      if (newRole === OrgRole.OWNER) {
        return NextResponse.json(
          { success: false, message: 'Only the OWNER can transfer ownership or create another owner' },
          { status: 403 }
        );
      }
    }

    // If changing to OWNER, it is a special transfer logic or just allowed for OWNER (but let's keep role update straightforward)
    if (newRole === OrgRole.OWNER && callerRole !== OrgRole.OWNER) {
      return NextResponse.json(
        { success: false, message: 'Only the current OWNER can assign the OWNER role' },
        { status: 403 }
      );
    }

    // Update the role
    const updatedMembership = await prisma.orgMembership.update({
      where: {
        userId_orgId: {
          userId: targetUserId,
          orgId,
        }
      },
      data: {
        role: newRole
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_MEMBER_ROLE',
        targetId: targetUserId,
        metadata: { prevRole: targetMembership.role, newRole },
        userId: workspaceContext.userId,
        orgId,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully',
      data: { membership: updatedMembership }
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// DELETE /api/workspaces/[orgId]/members
// Remove a member from the organization
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID parameter is required' },
        { status: 400 }
      );
    }

    const callerUserId = workspaceContext.userId;
    const callerRole = workspaceContext.memberRole;

    // Retrieve target membership
    const targetMembership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: targetUserId,
          orgId,
        }
      }
    });

    if (!targetMembership) {
      return NextResponse.json(
        { success: false, message: 'Target user is not a member of this organization' },
        { status: 404 }
      );
    }

    // Allow user to leave voluntarily (as long as they aren't the OWNER)
    const isLeavingVoluntarily = targetUserId === callerUserId;

    if (!isLeavingVoluntarily) {
      // If not leaving voluntarily, caller must be OWNER or ADMIN
      if (callerRole !== OrgRole.OWNER && callerRole !== OrgRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Only organization owners and admins can remove members' },
          { status: 403 }
        );
      }

      // Cannot remove the OWNER
      if (targetMembership.role === OrgRole.OWNER) {
        return NextResponse.json(
          { success: false, message: 'Cannot remove the organization owner' },
          { status: 403 }
        );
      }

      // ADMINs cannot remove other ADMINs
      if (callerRole === OrgRole.ADMIN && targetMembership.role === OrgRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: 'ADMINs cannot remove other ADMINs' },
          { status: 403 }
        );
      }
    } else {
      // Cannot leave if they are the OWNER
      if (targetMembership.role === OrgRole.OWNER) {
        return NextResponse.json(
          { success: false, message: 'The organization owner cannot leave the organization. Please transfer ownership first.' },
          { status: 400 }
        );
      }
    }

    // Delete membership
    await prisma.orgMembership.delete({
      where: {
        userId_orgId: {
          userId: targetUserId,
          orgId,
        }
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: isLeavingVoluntarily ? 'MEMBER_LEFT' : 'MEMBER_REMOVED',
        targetId: targetUserId,
        metadata: { email: targetMembership.userId },
        userId: callerUserId,
        orgId,
      }
    });

    return NextResponse.json({
      success: true,
      message: isLeavingVoluntarily 
        ? 'You have successfully left the organization workspace.' 
        : 'Member removed successfully'
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
