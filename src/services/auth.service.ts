'use client';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

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
            const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
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
        console.log("[AuthService] Login called with:", data.emailOrPhoneOrUsername);
        const response = await this.request<AuthUserResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include'
        });
        console.log("[AuthService] Login response:", response);


        if (response && (response as any).success) {
            console.log("[AuthService] Login success, setting local session flag.");
            this.setCookie('is_authenticated', 'true');
        }

        // token in cookie
        if (response && (response as any).data?.tokens?.accessToken) {
            const token = (response as any).data.tokens.accessToken;
            this.setCookie('token', token);
            this.setCookie('accessToken', token);
        }

        return response;
    }

    async sendOtp(purpose: 'register' | 'login', email: string): Promise<SuccessResponse> {
        return this.request<SuccessResponse>(`/auth/sendOtp/${purpose}`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async verifyOtp(data: VerifyOtpRequest): Promise<SuccessResponse> {
        const response = await this.request<SuccessResponse>('/auth/verifyOtp', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response && response.success) {
            this.setCookie('is_authenticated', 'true');
        }
        return response;
    }

    async verifyEmail(data: VerifyEmailRequest): Promise<SuccessResponse> {
        const response = await this.request<SuccessResponse>('/auth/verifyEmail', {
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

    // OAuth 
    initiateGoogleOAuth() {
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    initiateGithubOAuth() {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }

    async exchangeOAuthToken(tempOAuthToken: string): Promise<OAuthTokenResponse> {
        const response = await this.request<OAuthTokenResponse>('/auth/oauth/token', {
            method: 'POST',
            body: JSON.stringify({ tempOAuthToken })
        });

        if (response && response.success && response.data?.tokens?.accessToken) {
            this.setCookie('token', response.data.tokens.accessToken);
        }
        return response;
    }

    async logout() {
        try {
            // Clear cookies 
            const cookieNames = ['token', 'accessToken', 'refreshToken', 'connect.sid', 'reset_authorized', 'is_authenticated'];

            //deletecookies 
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
