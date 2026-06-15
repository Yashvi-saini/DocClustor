import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
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
    const message = error instanceof Error ? error.message : 'Failed to list workspaces';
    if (message === 'No authentication token found' || message === 'Invalid or expired token') {
      return unauthorized();
    }
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
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

    const org = await createOrganisation(jwt.userId, {
      name,
      cin,
      gstin,
      industry,
      logo,
    });

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      data: { organisation: org },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create organization';
    if (message === 'No authentication token found' || message === 'Invalid or expired token') {
      return unauthorized();
    }
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
