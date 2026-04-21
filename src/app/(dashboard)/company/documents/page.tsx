import React from "react";
import { DocumentsView } from "@/features/documents/components/DocumentsView";

export default function CompanyDocumentsPage() {
    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto">
            <DocumentsView 
                title="Company Documents" 
                description="Manage, organize, and access all your company files."
            />
        </div>
    );
}
