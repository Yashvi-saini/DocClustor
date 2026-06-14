import React from 'react';
import { ProfileView } from '@/features/profile/components/ProfileView';

export const metadata = {
    title: 'Profile | DocClustor',
    description: 'Manage your personal information and security settings.',
};

export default function ProfilePage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <ProfileView />
        </div>
    );
}
