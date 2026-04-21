import React from "react";
import { DocumentsView } from "@/features/documents/components/DocumentsView";

export default function IndividualDocumentsPage() {
    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto">
            <DocumentsView 
                title="Personal Documents" 
                description="Manage, organize, and access all your individual files."
            />
        </div>
    );
}
