"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isSetupPage = pathname?.includes("/setup");

    return (
        <DashboardProvider>
            <div className="flex bg-[#F5F8FA] min-h-screen">
                {!isSetupPage && <Sidebar />}
                <main className={`flex-1 p-4 sm:p-2 overflow-y-auto h-screen ${isSetupPage ? "w-full" : ""}`}>
                    {children}
                </main>
            </div>
        </DashboardProvider>
    );
}
