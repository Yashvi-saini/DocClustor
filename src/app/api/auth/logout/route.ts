// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
//
// Logs the user out by clearing the auth cookie.
// Since the JWT lives in an HttpOnly cookie, we just delete that cookie.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Delete the token cookie by setting it to expire immediately
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expires immediately
    path: '/',
  });

  return response;
}
