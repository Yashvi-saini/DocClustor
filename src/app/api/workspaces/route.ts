import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
import { listWorkspaces, createOrganisation } from '@backend/services/workspace.service';

//GET /api/workspaces

export async function GET(request: NextRequest) {
  try {
    const jwt = await requireAuth(request);
    const workspaces = await listWorkspaces(jwt.userId);

    return NextResponse.json({
      success: true,
      message: 'Workspaces retrieved successfully',
      data: { workspaces },
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// POST /api/workspaces

export async function POST(request: NextRequest) {
  try {
    const jwt = await requireAuth(request);
    const body = await request.json();
    const { name, cin, gstin, industry, logo } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Organization name is required' },
        { status: 400 }
      );
    }

    const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);

    const org = await createOrganisation(jwt.userId, {
      name: name.trim().slice(0, 120),
      cin: str(cin, 40),
      gstin: str(gstin, 40),
      industry: str(industry, 80),
      logo: str(logo, 2048),
    });

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      data: { organisation: org },
    }, { status: 201 });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
