import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace, handleWorkspaceError } from '@backend/middleware/workspace';
import { prisma } from '@backend/db/prisma';
import { OrgRole } from '@prisma/client';

// GET /api/workspaces/[orgId]
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

    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            documents: true,
          }
        }
      }
    });

    if (!org) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        organisation: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          cin: org.cin,
          gstin: org.gstin,
          logo: org.logo,
          industry: org.industry,
          storageQuota: org.storageQuota.toString(),
          createdAt: org.createdAt,
          memberCount: org._count.members,
          documentCount: org._count.documents,
        }
      }
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}

// PATCH /api/workspaces/[orgId]
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

    // Role verification: Only OWNER or ADMIN can modify organization settings
    if (workspaceContext.memberRole !== OrgRole.OWNER && workspaceContext.memberRole !== OrgRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only organization owners and admins can update settings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, cin, gstin, industry, logo } = body;

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim().slice(0, 120);
    }
    if (cin !== undefined) updateData.cin = typeof cin === 'string' ? cin.trim().slice(0, 40) || null : null;
    if (gstin !== undefined) updateData.gstin = typeof gstin === 'string' ? gstin.trim().slice(0, 40) || null : null;
    if (industry !== undefined) updateData.industry = typeof industry === 'string' ? industry.slice(0, 80) || null : null;
    if (logo !== undefined) updateData.logo = typeof logo === 'string' ? logo.slice(0, 2048) || null : null;

    const updatedOrg = await prisma.organisation.update({
      where: { id: orgId },
      data: updateData,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ORGANISATION_SETTINGS',
        targetId: orgId,
        metadata: updateData,
        userId: workspaceContext.userId,
        orgId,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Organization settings updated successfully',
      data: { organisation: updatedOrg }
    });
  } catch (error: unknown) {
    return handleWorkspaceError(error);
  }
}
