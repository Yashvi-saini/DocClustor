"use client";

import React from "react";
import { ChatInterface } from "@/features/chat";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function UnifiedRagBotPage() {
  const { activeWorkspace } = useWorkspace();
  const isOrg = activeWorkspace?.type === "org";

  return (
    <div className="flex flex-col h-full w-full font-poppins px-4 py-2 sm:px-6 sm:py-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 mb-4 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003259]">
          {isOrg ? `${activeWorkspace?.name} AI Assistant` : "RAG Bot Assistant"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          {isOrg 
            ? "Interact with your organization's knowledge base and documents." 
            : "Interact with your personal knowledge base."}
        </p>
      </div>
      
      <div className="flex-1 min-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  );
}
