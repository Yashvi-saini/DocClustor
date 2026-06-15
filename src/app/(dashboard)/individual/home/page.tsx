"use client";

import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { FavoritesSection } from '@/features/dashboard/components/FavoritesSection';
import { UploadSection } from '@/features/dashboard/components/UploadSection';
import { RecentFilesSection } from '@/features/dashboard/components/RecentFilesSection';

import { useDashboard } from '@/features/dashboard/context/DashboardContext';

export default function IndividualDashboardPage() {
    const { userProfile } = useDashboard();
    const username = userProfile?.name || "User";
    const avatarUrl = userProfile?.avatar || undefined;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <DashboardHeader username={username} avatarUrl={avatarUrl} />
            <FavoritesSection />
            <UploadSection />
            <RecentFilesSection />
        </div>
    );
}
