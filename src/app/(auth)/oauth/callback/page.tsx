'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

function OAuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<string>('Authenticating...');

    useEffect(() => {
        const handleCallback = async () => {
            //  find token in common query param names
            const tempToken =
                searchParams.get('tempToken') ||
                searchParams.get('token') ||
                searchParams.get('tempOAuthToken') ||
                searchParams.get('code');

            if (!tempToken) {
                setStatus('Error: No token received from provider.');
                return;
            }

            try {
                const response = await authService.exchangeOAuthToken(tempToken);
                if (response.success && response.data) {
                    // Storing tokens 
                    if (response.data.tokens) {
                        localStorage.setItem('accessToken', response.data.tokens.accessToken);
                        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
                    }
                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }

                    setStatus('Authentication successful! Redirecting...');
                    // Redirect todashboard
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                } else {
                    console.error('OAuth Exchange Failed', response);
                    setStatus('Authentication failed. Please try again.');
                }
            } catch (error) {
                console.error('OAuth Error:', error);
                setStatus('An error occurred during authentication.');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">OAuth Callback</h2>
                <p className="text-gray-600">{status}</p>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading authentication...</div>}>
            <OAuthCallbackContent />
        </Suspense>
    );
}
