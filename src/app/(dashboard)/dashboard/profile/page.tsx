"use client";

import React from 'react';
import { ProfileView } from '@/features/profile/components/ProfileView';

export default function UnifiedProfilePage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <ProfileView />
        </div>
    );
}
