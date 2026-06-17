"use client";

import React from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { FavoritesSection } from "@/features/dashboard/components/FavoritesSection";
import { UploadSection } from "@/features/dashboard/components/UploadSection";
import { RecentFilesSection } from "@/features/dashboard/components/RecentFilesSection";
import { useDashboard } from "@/features/dashboard/context/DashboardContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Building2, User } from "lucide-react";

import { InvitationsBanner } from "@/features/dashboard/components/InvitationsBanner";

export default function DashboardHomePage() {
    const { userProfile } = useDashboard();
    const { activeWorkspace } = useWorkspace();
    const username = userProfile?.name || "User";
    const avatarUrl = userProfile?.avatar || undefined;

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardHeader username={username} avatarUrl={avatarUrl} />
            </div>

            {/* Pending Workspace Invitations */}
            <InvitationsBanner />

            {/* Workspace Context Bar */}
            {activeWorkspace && (
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#003259]/10 flex items-center justify-center text-[#003259]">
                            {activeWorkspace.type === "org" ? (
                                <Building2 size={20} />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current Workspace</p>
                            <h2 className="text-base font-bold text-[#003259]">{activeWorkspace.name}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                            activeWorkspace.type === "org" 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                            {activeWorkspace.type === "org" ? "Org Space" : "Personal Space"}
                        </span>
                    </div>
                </div>
            )}

            <FavoritesSection />
            <UploadSection />
            <RecentFilesSection />
        </div>
    );
}
