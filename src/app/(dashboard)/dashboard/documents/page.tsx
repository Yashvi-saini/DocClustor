"use client";

import React from "react";
import { DocumentsView } from "@/features/documents/components/DocumentsView";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function UnifiedDocumentsPage() {
    const { activeWorkspace } = useWorkspace();
    const isOrg = activeWorkspace?.type === "org";
    
    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto">
            <DocumentsView 
                title={isOrg ? `${activeWorkspace?.name} Documents` : "Personal Documents"} 
                description={isOrg 
                    ? "Manage, organize, and access all documents within this organization workspace."
                    : "Manage, organize, and access all your individual files."
                }
            />
        </div>
    );
}
