import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${BASE}/login?error=${encodeURIComponent('GitHub OAuth is not configured. Contact the administrator.')}`
    );
  }

  const redirectUri = `${BASE}/api/auth/github/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=user:email`;

  return NextResponse.redirect(githubAuthUrl);
}
