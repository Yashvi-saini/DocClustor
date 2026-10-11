import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@backend/db/prisma';
import { createOAuthTempToken } from '@backend/utils/session';
import { sanitizeAuthError } from '@backend/utils/errorSanitizer';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const state = searchParams.get('state');
  const expectedState = request.cookies.get('oauth_state')?.value;
  if (!error && (!state || !expectedState || state !== expectedState)) {
    return NextResponse.redirect(`${BASE}/login?error=${encodeURIComponent('Invalid sign-in request. Please try again.')}`);
  }

  if (error || !code) {
    const cleanErr = sanitizeAuthError(error || 'No authorization code provided');
    return NextResponse.redirect(`${BASE}/login?error=${encodeURIComponent(cleanErr)}`);
  }

  try {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

    // 1. Exchange code for access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[GitHub Callback] Token exchange failed:', errBody);
      throw new Error('Failed to exchange authorization code');
    }

    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error('No access token returned from GitHub');

    // 2. Fetch user profile
    const authHeaders = {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      'User-Agent': 'DocCluster',
    };

    const profileRes = await fetch('https://api.github.com/user', { headers: authHeaders });
    if (!profileRes.ok) throw new Error('Failed to fetch GitHub profile');
    const profile = await profileRes.json();

    const name: string = profile.name || profile.login || 'User';
    const avatar: string | null = profile.avatar_url || null;
    let email: string = profile.email || '';

    // 3. If email is private, fetch from /user/emails
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', { headers: authHeaders });
      if (emailsRes.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
        const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
        if (primary) email = primary.email;
      }
    }

    if (!email) throw new Error('No verified email found on this GitHub account');


    const existing = await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } });
    if (existing && !existing.emailVerified) {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true, password: null, tokenVersion: { increment: 1 } },
      });
    }

    // 4. Find-or-create user (lean select projection)
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

    // 5. Issue short-lived temp JWT (5 min)
    const tempToken = await createOAuthTempToken(user.id, user.email);

    const done = NextResponse.redirect(`${BASE}/oauth/callback?tempOAuthToken=${encodeURIComponent(tempToken)}`);
    done.cookies.set('oauth_state', '', { path: '/', maxAge: 0 });
    return done;
  } catch (err) {
    const msg = sanitizeAuthError(err, 'GitHub authentication failed');
    console.error('[GitHub Callback Exception]', err);
    return NextResponse.redirect(`${BASE}/login?error=${encodeURIComponent(msg)}`);
  }
}
