// ─── POST /api/auth/login ──────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// In Next.js App Router, any file named `route.ts` becomes an API endpoint.
// This file handles POST requests to /api/auth/login
//
// WHAT HAPPENS HERE:
// 1. Read the email & password from the request body
// 2. Validate the input (never trust what the client sends!)
// 3. Call our auth service to verify credentials
// 4. If valid → set a secure HttpOnly cookie with the JWT token and return user info
// 5. If invalid → return a 400/500 error
//
// HttpOnly Cookie: A cookie the browser CANNOT read with JavaScript.
// This protects against XSS attacks stealing your token.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@backend/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, emailOrPhoneOrUsername } = body;
    const resolvedEmail = email || emailOrPhoneOrUsername;

    // Basic validation
    if (!resolvedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { user, token } = await loginUser({ email: resolvedEmail, password });

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });

    // Set the JWT token as an HttpOnly cookie (much more secure than localStorage)
    response.cookies.set('token', token, {
      httpOnly: true,       // JS cannot read this cookie (protects against XSS)
      secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
      sameSite: 'lax',      // Protects against CSRF attacks
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
