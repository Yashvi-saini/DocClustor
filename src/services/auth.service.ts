
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

// Import the Server Actions
import {
    registerAction,
    loginAction,
    sendOtpAction,
    verifyOtpAction,
    verifyEmailAction,
    exchangeOAuthTokenAction,
    resetPasswordAction
} from './auth.actions';

const API_BASE_URL = 'https://doc-cluster.me/api';

class AuthService {
   
    async register(data: RegisterRequest): Promise<AuthUserResponse> {
        return registerAction(data);
    }

    async login(data: LoginRequest): Promise<AuthUserResponse> {
        return loginAction(data);
    }

    async sendOtp(purpose: 'register' | 'login', email: string): Promise<SuccessResponse> {
        return sendOtpAction(purpose, email);
    }

    async verifyOtp(data: VerifyOtpRequest): Promise<SuccessResponse> {
        return verifyOtpAction(data);
    }

    async verifyEmail(data: VerifyEmailRequest): Promise<SuccessResponse> {
        return verifyEmailAction(data);
    }

    async exchangeOAuthToken(tempOAuthToken: string): Promise<OAuthTokenResponse> {
        return exchangeOAuthTokenAction(tempOAuthToken);
    }

    async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
        return resetPasswordAction(data);
    }

    initiateGoogleOAuth(): void {
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    initiateGithubOAuth(): void {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }
}

export const authService = new AuthService();
