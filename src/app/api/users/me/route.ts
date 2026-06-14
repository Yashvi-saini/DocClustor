// ─── GET + PATCH /api/users/me ─────────────────────────────────────────────────
//
// GET   → Returns the logged-in user's profile data
// PATCH → Update the user's profile (name, etc.)
//
// The "me" pattern is standard — instead of /api/users/:id you say /api/users/me
// which automatically refers to whoever is currently logged in.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
import { getUserById, updateUserProfile } from '@backend/services/user.service';

// ── GET /api/users/me ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const jwtPayload = await requireAuth(request);
    const user = await getUserById(jwtPayload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile fetched',
      data: { user },
    });
  } catch {
    return unauthorized();
  }
}

// ── PATCH /api/users/me ───────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const jwtPayload = await requireAuth(request);
    const body = await request.json();

    const updated = await updateUserProfile(jwtPayload.userId, {
      name: body.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      data: { user: updated },
    });
  } catch {
    return unauthorized();
  }
}
