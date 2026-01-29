"use client";

import React from "react";
import { Plus, File as FileIcon } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

export function FavoritesSection() {
    const { favorites } = useDashboard();

   
    const maxSlots = 9;
    const slots = Array(maxSlots).fill(null);

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
                                onClick={() => window.open(file.url, '_blank')}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer shadow-sm p-2 gap-1 text-center"
                                title={file.name}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <FileIcon size={16} />
                                </div>
                                <span className="text-[10px] text-gray-700 font-semibold truncate w-full px-1">
                                    {file.name}
                                </span>
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
        </div>
    );
}
