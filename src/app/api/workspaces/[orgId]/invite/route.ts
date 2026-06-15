import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
import { inviteToOrganisation } from '@backend/services/workspace.service';
import { OrgRole } from '@prisma/client';

// POST /api/workspaces/[orgId]/invite

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const jwt = await requireAuth(request);
    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Recipient email is required' },
        { status: 400 }
      );
    }

    const targetRole = role || OrgRole.VIEWER;
    if (!Object.values(OrgRole).includes(targetRole)) {
      return NextResponse.json(
        { success: false, message: 'Invalid membership role specified' },
        { status: 400 }
      );
    }

    const membership = await inviteToOrganisation(jwt.userId, orgId, email, targetRole);

    return NextResponse.json({
      success: true,
      message: 'Member invited successfully',
      data: { membership },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invitation failed';
    if (message === 'No authentication token found' || message === 'Invalid or expired token') {
      return unauthorized();
    }
    const status = message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json(
      { success: false, message },
      { status }
    );
  }
}
