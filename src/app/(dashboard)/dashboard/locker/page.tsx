"use client";

import React from "react";
import { LockerUI } from "@/features/locker/components/LockerUI";
import { BackgroundAnimation } from "@/components/ui/background-animation";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function UnifiedLockerPage() {
  const { activeWorkspace } = useWorkspace();
  const isOrg = activeWorkspace?.type === "org";

  return (
    <div className="relative w-full overflow-hidden bg-[#F0F8FF] min-h-[calc(100vh-64px)] font-poppins rounded-2xl">
      <BackgroundAnimation />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#003259]">
            {isOrg ? `${activeWorkspace?.name} Locker` : "Personal DigiLocker"}
          </h1>
          <p className="text-sm text-gray-500">
            {isOrg 
              ? "Access secure, end-to-end encrypted company vaults. Master PIN authentication required."
              : "Access your private personal document locker. Secure your credentials and certificates."}
          </p>
        </div>
        <LockerUI />
      </div>
    </div>
  );
}
