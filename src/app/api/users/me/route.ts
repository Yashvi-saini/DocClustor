import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@backend/middleware/auth.middleware';
import { getUserById } from '@backend/services/user.service';
import { updateProfile } from '@backend/services/profile.service';

// GET /api/users/me 
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
      message: 'Profile fetched successfully',
      data: { user },
    });
  } catch {
    return unauthorized();
  }
}

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  try {
    const jwtPayload = await requireAuth(request);
    const body = await request.json();

    const updated = await updateProfile(jwtPayload.userId, {
      name: body.name,
      avatar: body.avatar,
      phone: body.phone,
      dob: body.dob,
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
