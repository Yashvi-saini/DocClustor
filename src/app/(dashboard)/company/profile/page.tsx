import React from 'react';
import { ProfileView } from '@/features/profile/components/ProfileView';

export const metadata = {
    title: 'Company Profile | DocClustor',
    description: 'Manage your company information and security settings.',
};

export default function CompanyProfilePage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <ProfileView />
        </div>
    );
}
