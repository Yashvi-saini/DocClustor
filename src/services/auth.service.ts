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

import {
    registerAction,
    loginAction,
    sendOtpAction,
    verifyOtpAction,
    verifyEmailAction,
    resetPasswordAction,
    exchangeOAuthTokenAction
} from './auth.actions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

class AuthService {
    // Server Action Delegates
    register(data: RegisterRequest): Promise<AuthUserResponse> {
        return registerAction(data);
    }

    login(data: LoginRequest): Promise<AuthUserResponse> {
        return loginAction(data);
    }

    sendOtp(purpose: 'register' | 'login', email: string): Promise<SuccessResponse> {
        return sendOtpAction(purpose, email);
    }

    verifyOtp(data: VerifyOtpRequest): Promise<SuccessResponse> {
        return verifyOtpAction(data);
    }

    verifyEmail(data: VerifyEmailRequest): Promise<SuccessResponse> {
        return verifyEmailAction(data);
    }

    resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
        return resetPasswordAction(data);
    }

    // OAuth 
    initiateGoogleOAuth() {
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    initiateGithubOAuth() {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }

    async exchangeOAuthToken(tempOAuthToken: string): Promise<OAuthTokenResponse> {
        // Delegate to Server Action to avoid CORS issues
        return exchangeOAuthTokenAction(tempOAuthToken);
    }
}

export const authService = new AuthService();
