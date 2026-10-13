import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@backend/middleware/auth.middleware';
import { completeOnboarding } from '@backend/services/profile.service';
import { createToken } from '@backend/services/auth.service';
import { prisma } from '@backend/db/prisma';

// POST /api/profile/onboard

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const jwtPayload = await requireAuth(request);
    const userId = jwtPayload.userId;

    // 2. Parse body
    const body = await request.json();
    const { phone, dob, avatar, masterPin } = body;

    // Validate master PIN presence 
    if (!masterPin || typeof masterPin !== 'string' || !/^\d{4,6}$/.test(masterPin)) {
      return NextResponse.json(
        { success: false, message: 'Master PIN must be a numeric string between 4 and 6 digits' },
        { status: 400 }
      );
    }

    // Onboarding is one-time; otherwise a hijacked session could silently overwrite the master PIN
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { profileComplete: true } });
    if (current?.profileComplete) {
      return NextResponse.json(
        { success: false, message: 'Onboarding has already been completed' },
        { status: 409 }
      );
    }

    // 3. Complete onboarding
    const userProfile = await completeOnboarding(userId, {
      phone,
      dob,
      avatar,
      masterPin,
    });

    // 4. Fetch the updated user to get their new tokenVersion
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true, email: true },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found during onboarding update' },
        { status: 404 }
      );
    }

    // 5. Generate a fresh JWT reflecting the completed profile and new tokenVersion
    const newToken = await createToken({
      userId,
      email: updatedUser.email,
      profileComplete: true,
      tokenVersion: updatedUser.tokenVersion,
    });

    // 6. Return response and set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { user: userProfile },
    });

    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
