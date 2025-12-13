'use server';

import { cookies } from 'next/headers';
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

const API_BASE_URL = 'https://doc-cluster.me/api';

export async function registerAction(data: RegisterRequest): Promise<AuthUserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error: any) {
        return {
            message: error.message || 'Network error during registration',
            statusCode: 500,
        };
    }
}

export async function loginAction(data: LoginRequest): Promise<AuthUserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        // Handle cookies if present
        const cookieHeader = response.headers.get('Set-Cookie');
        if (cookieHeader) {

            const cookieStore = await cookies();


            let setCookies: string[] = [];
            if ('getSetCookie' in response.headers && typeof response.headers.getSetCookie === 'function') {
                setCookies = response.headers.getSetCookie();
            } else {
                // Fallback
                setCookies = [cookieHeader];
            }

            setCookies.forEach(cookieStr => {
                const firstPart = cookieStr.split(';')[0];
                const [name, value] = firstPart.split('=');
                if (name && value) {
                    cookieStore.set(name.trim(), value.trim(), {
                        httpOnly: true, // conservative default
                        secure: process.env.NODE_ENV === 'production',
                        path: '/'
                    });
                }
            });
        }

        return await response.json();
    } catch (error: any) {
        return {
            message: error.message || 'Network error during login',
            statusCode: 500,
        };
    }
}

export async function sendOtpAction(purpose: 'register' | 'login', email: string): Promise<SuccessResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/sendOtp/${purpose}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await response.json();
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
}

export async function verifyOtpAction(data: VerifyOtpRequest): Promise<SuccessResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verifyOtp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error: any) {
        return { success: false, message: error.message || 'Verification failed' };
    }
}

export async function verifyEmailAction(data: VerifyEmailRequest): Promise<SuccessResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verifyEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        // Handle cookies for email verification as well (likely sets session)
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
        return { success: false, message: error.message || 'Email verification failed' };
    }
}

export async function exchangeOAuthTokenAction(tempOAuthToken: string): Promise<OAuthTokenResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempOAuthToken }),
        });
        return await response.json();
    } catch (error: any) {
        // Return a failure structure matching the interface
        return {
            success: false,
            data: { user: {}, tokens: { accessToken: '', refreshToken: '' } } as any
        };
    }
}

export async function resetPasswordAction(data: ResetPasswordRequest): Promise<SuccessResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error: any) {
        return { success: false, message: error.message || 'Password reset failed' };
    }
}
