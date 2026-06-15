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

    // Set the JWT token as an HttpOnly cookie 
    response.cookies.set('token', token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',     
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
