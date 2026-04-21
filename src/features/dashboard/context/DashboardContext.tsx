"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FileItem {
    id: string;
    name: string;
    type: string; // 'PDF', 'Word', 'Excel', 'Image', etc.
    size: string;
    url: string; // For preview/download
    createdAt: Date;
    isFavorite: boolean;
    isLocked?: boolean;
}

interface DashboardContextType {
    files: FileItem[];
    favorites: FileItem[];
    lockedFiles: FileItem[];
    addFile: (file: File, isLocked?: boolean) => void;
    toggleFavorite: (id: string) => void;
    deleteFile: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [files, setFiles] = useState<FileItem[]>([]);

    const favorites = files.filter((file) => file.isFavorite);
    const lockedFiles = files.filter((file) => file.isLocked);

    const addFile = (file: File, isLocked: boolean = false) => {
        const newItem: FileItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: getFileType(file.name),
            size: formatFileSize(file.size),
            url: URL.createObjectURL(file), // Create a local URL for preview
            createdAt: new Date(),
            isFavorite: false,
            isLocked: isLocked,
        };
        // Add to beginning of list
        setFiles((prev) => [newItem, ...prev]);
    };

    const toggleFavorite = (id: string) => {
        setFiles((prev) =>
            prev.map((file) =>
                file.id === id ? { ...file, isFavorite: !file.isFavorite } : file
            )
        );
    };

    const deleteFile = (id: string) => {
        setFiles((prev) => prev.filter(f => f.id !== id));
    }

    return (
        <DashboardContext.Provider value={{ files, favorites, lockedFiles, addFile, toggleFavorite, deleteFile }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}

// determining file type based on extension
function getFileType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (["doc", "docx"].includes(ext || "")) return "Word";
    if (["xls", "xlsx"].includes(ext || "")) return "Excel";
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "Image";
    return "File";
}
// file size 
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
