
export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    emailOrPhoneOrUsername?: string;
    password?: string;
    otp?: string;
    email?: string; // used when login with OTP
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

// Responses
export interface AuthUserResponse {
    statusCode?: number;
    data?: {
        id: string;
        email: string;
        username: string;
    };
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
