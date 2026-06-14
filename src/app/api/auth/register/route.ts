import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@backend/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, username, role } = body;
    const resolvedName = name || username;

    if (!email || !password || !resolvedName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const { user } = await registerUser({
      email,
      password,
      name: resolvedName,
      role: role || 'INDIVIDUAL',
    });

    return NextResponse.json(
      { success: true, message: 'Account created successfully. Please verify your email.', data: { user } },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
