'use server';

import {
    RegisterRequest,
    AuthUserResponse,
    LoginRequest,
    SuccessResponse,
    VerifyOtpRequest,
    VerifyEmailRequest,
    OAuthTokenRequest,
    OAuthTokenResponse,
    ResetPasswordRequest
} from './auth.types';

import { cookies } from 'next/headers';

async function forwardCookies(response: Response) {
    const cookieHeader = response.headers.get('Set-Cookie');
    console.log('[AuthAction] Backend Set-Cookie Header:', cookieHeader); // Debug

    if (cookieHeader) {
        const cookieStore = await cookies();
        let setCookies: string[] = [];

        if (typeof response.headers.getSetCookie === 'function') {
         
            setCookies = response.headers.getSetCookie();
        } else {
            setCookies = [cookieHeader];
        }
        setCookies.forEach(cookieStr => {
           
            const firstSemi = cookieStr.indexOf(';');
            const pair = firstSemi > -1 ? cookieStr.substring(0, firstSemi) : cookieStr;
            const eqIndex = pair.indexOf('=');
            if (eqIndex > -1) {
                const name = pair.substring(0, eqIndex).trim();
                const value = pair.substring(eqIndex + 1).trim();
                if (name && value) {
                    console.log(`[AuthAction] Setting Cookie: ${name}`);
                    cookieStore.set(name, value, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        path: '/'
                    });
                }
            }
        });
    } else {
        console.log('[AuthAction] No Set-Cookie header found in response.');
    }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function registerAction(
    data: RegisterRequest
): Promise<AuthUserResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await res.json();
    } catch (e: any) {
        return { message: e.message || "Registration failed", statusCode: 500 };
    }
}

//  Login
export async function loginAction(
    data: LoginRequest
): Promise<AuthUserResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        // Forward cookies
        await forwardCookies(res);

        const responseData = await res.json();

        // no cookie then token 
        if (responseData && responseData.data?.tokens?.accessToken) {
            const cookieStore = await cookies();
            const hasTokenCookie = cookieStore.has('token') || cookieStore.has('accessToken');
            if (!hasTokenCookie) {
                console.log('[AuthAction] Fallback: Setting token cookie from login response body.');
                cookieStore.set('token', responseData.data.tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'
                });
            }
        }

        return responseData;
    } catch (e: any) {
        return { message: e.message || "Login failed", statusCode: 500 };
    }
}

//  Send OTP
export async function sendOtpAction(
    purpose: 'register' | 'login',
    email: string
): Promise<SuccessResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/sendOtp/${purpose}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await res.json();
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to send OTP" };
    }
}

// Verify OTP
export async function verifyOtpAction(
    data: VerifyOtpRequest
): Promise<SuccessResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/verifyOtp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await res.json();
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to verify OTP" };
    }
}

//  Verify Email
export async function verifyEmailAction(
    data: VerifyEmailRequest
): Promise<SuccessResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/verifyEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        await forwardCookies(res);
        return await res.json();
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to verify email" };
    }
}

//  Reset Password
export async function resetPasswordAction(
    data: ResetPasswordRequest
): Promise<SuccessResponse> {
    try {
        if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await res.json();
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to reset password" };
    }
}

export async function exchangeOAuthTokenAction(tempOAuthToken: string): Promise<OAuthTokenResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempOAuthToken }),
        });

   
        await forwardCookies(response);

        const data = await response.json();

        if (data && data.success && data.data?.tokens?.accessToken) {
            const cookieStore = await cookies();
            const hasTokenCookie = cookieStore.has('token') || cookieStore.has('accessToken');
            if (!hasTokenCookie) {
                console.log('[AuthAction] Fallback: Setting token cookie from response body.');
                cookieStore.set('token', data.data.tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'
                });
            }
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            data: { user: {}, tokens: { accessToken: '', refreshToken: '' } } as any
        };
    }
}

export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        const cookieNames = ['token', 'accessToken', 'refreshToken', 'connect.sid'];

        cookieNames.forEach(name => {
            cookieStore.set(name, '', { maxAge: 0, path: '/' });
        });

        if (API_BASE_URL) {
            await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }).catch(() => { });
        }

        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function setResetAuthorizedCookieAction() {
    const cookieStore = await cookies();
    cookieStore.set('reset_authorized', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 300 // 5 minutes
    });
    return { success: true };
}
