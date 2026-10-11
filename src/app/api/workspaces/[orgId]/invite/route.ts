import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
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

    if (!email || typeof email !== 'string' || !/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Recipient email is required' },
        { status: 400 }
      );
    }

    const targetRole = role || OrgRole.VIEWER;
    if (!Object.values(OrgRole).includes(targetRole) || targetRole === OrgRole.OWNER) {
      return NextResponse.json(
        { success: false, message: 'Invalid membership role specified' },
        { status: 400 }
      );
    }

    const membership = await inviteToOrganisation(jwt.userId, orgId, email.trim().toLowerCase(), targetRole);

    return NextResponse.json({
      success: true,
      message: 'Member invited successfully',
      data: { membership },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ success: false, message }, { status: 403 });
    }
    if (message === 'User is already a member of this organization.') {
      return NextResponse.json({ success: false, message }, { status: 409 });
    }
    return handleAuthError(error);
  }
}
