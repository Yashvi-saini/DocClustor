"use client";

import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import toast from "react-hot-toast";

export function UploadSection() {
    const { addFile } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = React.useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addFile(file);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
// enabling the grap and drop feature
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        if (!isDragging) setIsDragging(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            addFile(file);
        }
    };

    return (
        <div className="w-full mb-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            />
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-3 
                    ${isDragging
                        ? "border-[#1E9BFF] bg-[#D0EBFF] scale-[1.01] shadow-lg"
                        : "border-[#1E9BFF] bg-[#E0F2FE] hover:bg-[#D0EBFF]"
                    }
                `}
            >
                <div className="flex items-center gap-3 pointer-events-none">
                    <Upload className={`text-[#003259] transition-transform ${isDragging ? "scale-110" : ""}`} size={24} />
                    <span className="text-[#003259] font-bold text-lg font-poppins">
                        {isDragging ? "Drop to Upload!" : "Upload a document (Click or Drop)"}
                    </span>
                </div>
            </div>
        </div>
    );
}
