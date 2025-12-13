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
        return await res.json();
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

        // Forward cookies
        const cookieHeader = response.headers.get('Set-Cookie');
        if (cookieHeader) {
            const cookieStore = await cookies();
            let setCookies: string[] = [];
            if ('getSetCookie' in response.headers && typeof response.headers.getSetCookie === 'function') {
                setCookies = response.headers.getSetCookie();
            } else {
                setCookies = [cookieHeader];
            }
            setCookies.forEach(cookieStr => {
                const firstPart = cookieStr.split(';')[0];
                const [name, value] = firstPart.split('=');
                if (name && value) {
                    cookieStore.set(name.trim(), value.trim(), {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        path: '/'
                    });
                }
            });
        }

        return await response.json();
    } catch (error: any) {
        // Return a failure structure matching the interface
        return {
            success: false,
            data: { user: {}, tokens: { accessToken: '', refreshToken: '' } } as any
        };
    }
}
