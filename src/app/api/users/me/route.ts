import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
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
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  try {
    const jwtPayload = await requireAuth(request);
    const body = await request.json();

    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
    let dob: string | undefined;
    if (typeof body.dob === 'string') {
      if (Number.isNaN(new Date(body.dob).getTime())) {
        return NextResponse.json({ success: false, message: 'Invalid date of birth' }, { status: 400 });
      }
      dob = body.dob;
    }

    const updated = await updateProfile(jwtPayload.userId, {
      name: str(body.name, 100),
      avatar: str(body.avatar, 2048),
      phone: str(body.phone, 32),
      dob,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      data: { user: updated },
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
