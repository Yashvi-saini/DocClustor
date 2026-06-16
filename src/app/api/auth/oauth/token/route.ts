import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@backend/db/prisma';
import { createToken } from '@backend/services/auth.service';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { tempOAuthToken } = await request.json();

    if (!tempOAuthToken) {
      return NextResponse.json(
        { success: false, message: 'Temporary token is required' },
        { status: 400 }
      );
    }

    // 1. Verify the short-lived temp token
    const secret = new TextEncoder().encode(JWT_SECRET);
    let payload: jose.JWTPayload;
    try {
      const result = await jose.jwtVerify(tempOAuthToken, secret);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    // 2. Fetch user (lean — only what's needed for session token)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileComplete: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Create long-lived session token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      profileComplete: user.profileComplete,
      tokenVersion: user.tokenVersion,
    });

    // 4. Set HttpOnly cookie + respond
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileComplete: user.profileComplete,
        },
        tokens: {
          accessToken: token,
          refreshToken: '',
        },
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed';
    console.error('[OAuth Token Exchange]', message);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
