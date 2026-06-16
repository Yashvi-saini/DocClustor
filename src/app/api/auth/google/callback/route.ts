import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@backend/db/prisma';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${BASE}/login?error=${encodeURIComponent(error || 'No authorization code provided')}`);
  }

  try {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${BASE}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[Google Callback] Token exchange failed:', errBody);
      throw new Error('Failed to exchange authorization code');
    }

    const { access_token } = await tokenRes.json();

    // 2. Fetch user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileRes.ok) throw new Error('Failed to fetch Google profile');
    const profile = await profileRes.json();

    const email: string = profile.email;
    const name: string = profile.name || profile.given_name || 'User';
    const avatar: string | null = profile.picture || null;

    if (!email) throw new Error('No email returned from Google');

    // 3. Find-or-create user (lean select projection — no heavy columns)
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, profileComplete: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          emailVerified: true,
          profileComplete: false,
        },
        select: { id: true, email: true, profileComplete: true },
      });
    }

    // 4. Issue short-lived temp JWT (5 min) for client-side token exchange
    const secret = new TextEncoder().encode(JWT_SECRET);
    const tempToken = await new jose.SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(secret);

    return NextResponse.redirect(`${BASE}/oauth/callback?tempOAuthToken=${encodeURIComponent(tempToken)}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Google authentication failed';
    console.error('[Google Callback]', msg);
    return NextResponse.redirect(`${BASE}/login?error=${encodeURIComponent(msg)}`);
  }
}
