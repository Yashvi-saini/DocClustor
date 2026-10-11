import { NextRequest } from 'next/server';
import { JwtPayload } from '../types/api.types';
import { prisma } from '../db/prisma';

import * as jose from 'jose';

const AUTH_ERRORS = new Set(['No authentication token found', 'Invalid or expired token']);

export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    throw new Error('No authentication token found');
  }

  let payload: JwtPayload;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const result = await jose.jwtVerify(token, secret, { algorithms: ['HS256'] });
    payload = result.payload as unknown as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }

  if (!payload.userId || typeof payload.userId !== 'string') {
    throw new Error('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { tokenVersion: true, emailVerified: true },
  });
  if (!user || user.tokenVersion !== payload.tokenVersion || !user.emailVerified) {
    throw new Error('Invalid or expired token');
  }

  return payload;
}

export function unauthorized() {
  return Response.json(
    { success: false, message: 'Unauthorized. Please log in.' },
    { status: 401 }
  );
}

export function handleAuthError(error: any) {
  const message = error instanceof Error ? error.message : 'Authentication failed';
  if (AUTH_ERRORS.has(message)) {
    return unauthorized();
  }
  console.error('[Auth Error]', error);
  const status = typeof error?.status === 'number' ? error.status : 500;
  return Response.json(
    { success: false, message: status >= 500 ? 'An unexpected server error occurred' : message },
    { status }
  );
}
