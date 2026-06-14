// ─── Auth Middleware ───────────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// Almost every API route needs to check: "Is this user logged in? Who are they?"
// Instead of copy-pasting JWT verification code in every route.ts file,
// we put the logic here ONCE and just call `requireAuth(request)` anywhere.
//
// HOW IT WORKS:
// 1. The client (browser) sends a request with a cookie named `token`
// 2. This function reads that cookie, verifies the JWT signature using our secret
// 3. If valid → returns the decoded user info (userId, email, role)
// 4. If invalid/missing → throws an error, and the route returns 401 Unauthorized
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { JwtPayload } from '../types/api.types';

// NOTE: We use jose (not jsonwebtoken) because it works in Next.js Edge Runtime
// jsonwebtoken uses Node.js-only APIs that don't work in all Next.js environments
// Install: npm install jose
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the JWT token from the request cookie.
 * Returns the decoded user payload if valid.
 * Throws an error if missing or invalid — the route should return 401.
 */
export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Read the token from the cookie (sent automatically by the browser)
  const token = request.cookies.get('token')?.value;

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper: Creates a standard 401 Unauthorized response object.
 * Usage: return unauthorized();
 */
export function unauthorized() {
  return Response.json(
    { success: false, message: 'Unauthorized. Please log in.' },
    { status: 401 }
  );
}
