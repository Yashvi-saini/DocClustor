'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { toast } from "react-hot-toast";

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-lg">Loading authentication...</p></div>}>
            <OAuthCallbackContent />
        </Suspense>
    );
}

function OAuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Authenticating...');
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const tempOAuthToken = searchParams.get('tempOAuthToken') || searchParams.get('token');

        if (!tempOAuthToken) {
            console.error('OAuth callback params:', searchParams.toString());
            setStatus('Invalid OAuth callback.');
            return;
        }

        const exchange = async () => {
            try {
                const res = await authService.exchangeOAuthToken(tempOAuthToken);

                if (res.success) {
                    setStatus('Login successful! Redirecting...');
                    toast.success("Login Successful!");
                    const user = res.data?.user;
                    if (user?.profileComplete) {
                        router.replace('/dashboard/home');
                    } else {
                        router.replace('/onboarding');
                    }
                } else {
                    const errorMsg = (res as any).message || 'Authentication failed.';
                    setStatus(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                console.error(err);
                setStatus('OAuth error occurred.');
                toast.error('OAuth error occurred.');
            }
        };

        exchange();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-lg">{status}</p>
        </div>
    );
}
