import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://docclustor.me';

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/privacy',
                    '/terms',
                ],
                disallow: [
                    '/api/',
                    '/oauth/',
                    '/login',
                    '/signup',
                    '/forgot-password',
                    '/reset-password',
                    '/verify',
                    '/onboarding',
                    '/dashboard/',
                    '/company/',
                    '/individual/',
                    '/dummydash/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
