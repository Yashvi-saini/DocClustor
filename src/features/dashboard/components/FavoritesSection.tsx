"use client";

import React, { useState } from "react";
import { Plus, File as FileIcon, Lock } from "lucide-react";
import { useDashboard, FileItem } from "../context/DashboardContext";
import { LockerPinModal } from "../../locker/components/LockerPinModal";

export function FavoritesSection() {
    const { favorites, isLockerUnlocked } = useDashboard();
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<FileItem | null>(null);

    const maxSlots = 9;
    const slots = Array(maxSlots).fill(null);

    const handleFileClick = (file: FileItem) => {
        if (file.isLocked && !isLockerUnlocked) {
            setPendingFile(file);
            setPinModalOpen(true);
        } else {
            window.open(file.url, '_blank');
        }
    };

    return (
        <div className="w-full bg-[#1E9BFF] rounded-2xl p-6 mb-6 shadow-md transition-all">
            <h2 className="text-white text-xl font-bold font-poppins mb-4">
                My Favorites
            </h2>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-start">
                {slots.map((_, index) => {
                    const file = favorites[index];
                    if (file) {
                        return (
                            <div
                                key={file.id}
                                onClick={() => handleFileClick(file)}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer shadow-sm p-2 gap-1 text-center relative"
                                title={file.name}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <FileIcon size={16} />
                                </div>
                                <span className="text-[10px] text-gray-700 font-semibold truncate w-full px-1">
                                    {file.name}
                                </span>
                                {file.isLocked && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white p-0.5" title="Locked Document">
                                        <Lock size={8} />
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={`empty-${index}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-sm"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                                <Plus className="text-white" size={20} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <LockerPinModal 
                isOpen={pinModalOpen}
                onClose={() => {
                    setPinModalOpen(false);
                    setPendingFile(null);
                }}
                onSuccess={() => {
                    if (pendingFile) {
                        window.open(pendingFile.url, '_blank');
                    }
                }}
            />
        </div>
    );
}
