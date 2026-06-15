import { NextRequest } from 'next/server';
import { JwtPayload } from '../types/api.types';

import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;


export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Read the token from the cookie 
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

export function unauthorized() {
  return Response.json(
    { success: false, message: 'Unauthorized. Please log in.' },
    { status: 401 }
  );
}
