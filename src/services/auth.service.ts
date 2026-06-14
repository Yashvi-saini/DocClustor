'use client';

// ─── Frontend Auth Service (Rewired) ─────────────────────────────────────────
//
// This file is the BRIDGE between your UI components and the API routes.
//
// BEFORE: It called https://coolify.monu14.me/api/auth/login (external backend — DOWN)
// NOW:    It calls /api/auth/login (our own Next.js backend — WORKING ✅)
//
// The old version is safely archived in: src/services/_OLD_BACKEND_/
// ──────────────────────────────────────────────────────────────────────────────

import {
    RegisterRequest,
    LoginRequest,
    VerifyOtpRequest,
    VerifyEmailRequest,
    ResetPasswordRequest,
    OAuthTokenResponse,
    AuthUserResponse,
    SuccessResponse
} from './auth.types';

// CHANGED: No longer uses NEXT_PUBLIC_API_BASE_URL (the old backend)
// Instead, calls our own /api/* routes — no base URL needed (same domain)

class AuthService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {})
        };

        const config: RequestInit = {
            ...options,
            headers
        };

        try {
            // CHANGED: fetch(`/api${endpoint}`) instead of fetch(`${API_BASE_URL}${endpoint}`)
            // This means POST /api/auth/login goes to our own src/app/api/auth/login/route.ts
            const res = await fetch(`/api${endpoint}`, config);
            return await res.json();
        } catch (error) {
            console.error(`[AuthService] Request failed: ${endpoint}`, error);
            throw error;
        }
    }


    private setCookie(name: string, value: string, maxAge?: number) {
        let cookieString = `${name}=${value}; path=/;`;
        if (maxAge) {
            cookieString += ` max-age=${maxAge};`;
        }
        if (process.env.NODE_ENV === 'production') {
            cookieString += ' secure;';
        }
        cookieString += ' samesite=lax;';
        document.cookie = cookieString;
    }

    async register(data: RegisterRequest): Promise<AuthUserResponse> {
        return this.request<AuthUserResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async login(data: LoginRequest): Promise<AuthUserResponse> {
        const response = await this.request<AuthUserResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (response && (response as any).success) {
            this.setCookie('is_authenticated', 'true');
        }

        return response;
    }

    async sendOtp(purpose: 'register' | 'login', email: string): Promise<SuccessResponse> {
        return this.request<SuccessResponse>(`/auth/send-otp`, {
            method: 'POST',
            body: JSON.stringify({ email, purpose })
        });
    }

    async verifyOtp(data: VerifyOtpRequest): Promise<SuccessResponse> {
        const response = await this.request<SuccessResponse>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response && response.success) {
            this.setCookie('is_authenticated', 'true');
        }
        return response;
    }

    async verifyEmail(data: VerifyEmailRequest): Promise<SuccessResponse> {
        const response = await this.request<SuccessResponse>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (response && response.success) {
            this.setCookie('is_authenticated', 'true');
        }
        return response;
    }

    async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
        return this.request<SuccessResponse>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // OAuth — TEMPORARILY DISABLED
    // These used to redirect to the old backend (coolify.monu14.me).
    // We'll set up OAuth with Supabase Auth or NextAuth.js as the next step.
    initiateGoogleOAuth() {
        // OLD: window.location.href = `${API_BASE_URL}/auth/google`;
        console.warn('[AuthService] Google OAuth not yet configured for new backend');
        alert('Google Sign-In is being set up. Please use email/password for now.');
    }

    initiateGithubOAuth() {
        // OLD: window.location.href = `${API_BASE_URL}/auth/github`;
        console.warn('[AuthService] GitHub OAuth not yet configured for new backend');
        alert('GitHub Sign-In is being set up. Please use email/password for now.');
    }

    async exchangeOAuthToken(tempOAuthToken: string): Promise<OAuthTokenResponse> {
        const response = await this.request<OAuthTokenResponse>('/auth/oauth/token', {
            method: 'POST',
            body: JSON.stringify({ tempOAuthToken })
        });

        if (response && response.success && response.data?.tokens?.accessToken) {
            this.setCookie('is_authenticated', 'true');
        }
        return response;
    }

    async logout() {
        try {
            // Also call our new backend logout route to clear the HttpOnly cookie
            await fetch('/api/auth/logout', { method: 'POST' });

            // Clear client-side cookies as before
            const cookieNames = ['token', 'accessToken', 'refreshToken', 'connect.sid', 'reset_authorized', 'is_authenticated'];

            cookieNames.forEach(name => {
                document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                document.cookie = `${name}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            });

        } catch (error) {
            console.error("Logout Error", error);
        }

        return { success: true };
    }

    async setResetAuthorizedCookie() {
        this.setCookie('reset_authorized', 'true', 300);
        return { success: true };
    }
}

export const authService = new AuthService();
