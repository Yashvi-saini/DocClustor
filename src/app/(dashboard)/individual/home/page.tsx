"use client";

import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { FavoritesSection } from '@/features/dashboard/components/FavoritesSection';
import { UploadSection } from '@/features/dashboard/components/UploadSection';
import { RecentFilesSection } from '@/features/dashboard/components/RecentFilesSection';

export default function IndividualDashboardPage() {
    // for now one name only 
    const username = "User";

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <DashboardHeader username={username} />
            <FavoritesSection />
            <UploadSection />
            <RecentFilesSection />
        </div>
    );
}
