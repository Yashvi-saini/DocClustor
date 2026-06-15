
export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
}

export interface LoginRequest {
    emailOrPhoneOrUsername?: string;
    password?: string;
    otp?: string;
    email?: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
    purpose: 'register' | 'login';
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface OAuthTokenRequest {
    tempOAuthToken: string;
}

export interface ResetPasswordRequest {
    email: string;
    password: string;
}


export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    profileComplete: boolean;
}

export interface AuthUserResponse {
    success?: boolean;
    statusCode?: number;
    data?: { user: AuthUser };
    message?: string;
}

export interface OAuthTokenResponse {
    success: boolean;
    data: {
        user: AuthUserResponse;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
}

export interface SuccessResponse {
    success: boolean;
    message: string;
}
