import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@backend/services/auth.service';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';
import { rateLimit, clientIp } from '@backend/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, username } = body;
    const resolvedName = name || username;

    if (!email || !password || !resolvedName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (
      typeof email !== 'string' || typeof password !== 'string' || typeof resolvedName !== 'string' ||
      password.length < 8 || password.length > 128 || resolvedName.length > 100
    ) {
      return NextResponse.json(
        { success: false, message: 'Provide a valid email, a password of 8-128 characters, and a name' },
        { status: 400 }
      );
    }

    const limited = rateLimit(`register:${clientIp(request)}`, 10, 60 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, message: 'Too many sign-up attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const { user } = await registerUser({
      email,
      password,
      name: resolvedName,
    });

    return NextResponse.json(
      { success: true, message: 'Account created successfully. Please verify your email.', data: { user } },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = sanitizeAuthError(error, 'Registration failed');
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
