import * as jose from 'jose';
import type { NextRequest, NextResponse } from 'next/server';
import { WorkspaceContext } from '../types/api.types';

const LOCKER_TTL_SECONDS = 30 * 60;
const RESET_TTL_SECONDS = 10 * 60;

export const RESET_COOKIE = 'reset_session';

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

export function workspaceIdOf(ctx: WorkspaceContext): string {
  return ctx.type === 'personal' ? ctx.userId : ctx.orgId;
}

export function lockerCookieName(workspaceId: string): string {
  return `locker_session_${workspaceId}`;
}

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export async function setLockerSession(response: NextResponse, userId: string, workspaceId: string) {
  const token = await new jose.SignJWT({ typ: 'locker', ws: workspaceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${LOCKER_TTL_SECONDS}s`)
    .sign(secretKey());

  response.cookies.set(lockerCookieName(workspaceId), token, {
    ...cookieBase(),
    maxAge: LOCKER_TTL_SECONDS,
  });
}

export function clearLockerSession(response: NextResponse, workspaceId: string) {
  response.cookies.set(lockerCookieName(workspaceId), '', { ...cookieBase(), maxAge: 0 });
}

export async function isLockerUnlocked(
  request: NextRequest,
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const token = request.cookies.get(lockerCookieName(workspaceId))?.value;
  if (!token) return false;
  try {
    const { payload } = await jose.jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    return payload.typ === 'locker' && payload.ws === workspaceId && payload.sub === userId;
  } catch {
    return false;
  }
}

export async function setResetSession(response: NextResponse, email: string) {
  const token = await new jose.SignJWT({ typ: 'reset', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${RESET_TTL_SECONDS}s`)
    .sign(secretKey());

  response.cookies.set(RESET_COOKIE, token, { ...cookieBase(), maxAge: RESET_TTL_SECONDS });
}

export async function readResetSession(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(RESET_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    return payload.typ === 'reset' && typeof payload.email === 'string' ? payload.email : null;
  } catch {
    return null;
  }
}

export async function createOAuthTempToken(userId: string, email: string): Promise<string> {
  return new jose.SignJWT({ typ: 'oauth_temp', userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secretKey());
}

export async function verifyOAuthTempToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (payload.typ !== 'oauth_temp' || typeof payload.userId !== 'string') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
