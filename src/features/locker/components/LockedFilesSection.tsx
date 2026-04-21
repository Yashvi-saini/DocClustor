"use client";

import React from "react";
import { FileText, MoreVertical, FileSpreadsheet, File as FileIcon, Image as ImageIcon, Music } from "lucide-react";
import { useDashboard, FileItem } from "../../dashboard/context/DashboardContext";
import { format } from "date-fns";

export function LockedFilesSection() {
    const { lockedFiles } = useDashboard();

    const getFileIcon = (type: string) => {
        switch (type) {
            case "PDF":
                return <FileText className="text-red-400" size={24} />;
            case "Word":
                return <FileIcon className="text-blue-400" size={24} />;
            case "Excel":
                return <FileSpreadsheet className="text-green-400" size={24} />;
            case "Image":
                return <ImageIcon className="text-pink-400" size={24} />;
            case "Music":
                return <Music className="text-orange-400" size={24} />;
            default:
                return <FileIcon className="text-gray-400" size={24} />;
        }
    };

    if (lockedFiles.length === 0) {
        return (
            <div className="w-full text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                    <FileIcon className="text-gray-300" size={24} />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">No encrypted files found</p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            {lockedFiles.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-50">
                        {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-[#003259] truncate">{file.name}</h4>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-gray-400 font-bold tracking-tight">
                                {format(file.createdAt, "dd/MM/yyyy")}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">
                                {file.size}
                            </span>
                        </div>
                    </div>

                    <button className="text-gray-300 hover:text-gray-600 transition-colors">
                        <MoreVertical size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
