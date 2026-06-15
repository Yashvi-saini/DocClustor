"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import toast from "react-hot-toast";

export interface FileItem {
    id: string;
    name: string;
    type: string; // 'PDF', 'Word', 'Excel', 'Image', etc.
    size: string;
    url: string; // For preview/download
    createdAt: Date;
    isFavorite: boolean;
    isLocked?: boolean;
    content?: string;
}

interface DashboardContextType {
    files: FileItem[];
    favorites: FileItem[];
    lockedFiles: FileItem[];
    addFile: (file: File, isLocked?: boolean) => Promise<void>;
    toggleFavorite: (id: string) => void;
    deleteFile: (id: string) => Promise<void>;
    
    // Locker states & methods
    isLockerUnlocked: boolean;
    hasLocker: boolean;
    isLockerLockedOut: boolean;
    lockedUntil: Date | null;
    checkLockerStatus: () => Promise<void>;
    unlockLocker: (pin: string) => Promise<boolean>;
    setupLocker: (pin: string) => Promise<boolean>;
    lockLocker: () => Promise<void>;
    refreshFiles: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const { activeWorkspace } = useWorkspace();

    // Locker state variables
    const [isLockerUnlocked, setIsLockerUnlocked] = useState(false);
    const [hasLocker, setHasLocker] = useState(false);
    const [isLockerLockedOut, setIsLockerLockedOut] = useState(false);
    const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

    const getHeaders = () => {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (activeWorkspace) {
            headers["X-Workspace-Context"] = activeWorkspace.type === "personal" ? "personal" : `org:${activeWorkspace.id}`;
        }
        return headers;
    };

    const fetchDocuments = async () => {
        if (!activeWorkspace) return;
        try {
            const res = await fetch("/api/documents", {
                headers: getHeaders(),
            });
            const json = await res.json();
            if (json.success && json.data?.documents) {
                const mapped: FileItem[] = json.data.documents.map((doc: any) => ({
                    id: doc.id,
                    name: doc.title,
                    type: doc.type,
                    size: doc.fileSize ? formatFileSize(Number(doc.fileSize)) : "0 Bytes",
                    url: doc.fileUrl || `data:text/plain;base64,${btoa(unescape(encodeURIComponent(doc.content || "")))},urlType`,
                    createdAt: new Date(doc.createdAt),
                    isFavorite: localStorage.getItem(`fav_${doc.id}`) === "true",
                    isLocked: doc.lockerId !== null,
                    content: doc.content,
                }));
                setFiles(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    const checkLockerStatus = async () => {
        if (!activeWorkspace) return;
        try {
            const res = await fetch("/api/locker/status", {
                headers: getHeaders(),
            });
            const json = await res.json();
            if (json.success && json.data) {
                setIsLockerUnlocked(json.data.isSessionUnlocked);
                setHasLocker(json.data.hasLocker);
                setIsLockerLockedOut(json.data.isLocked);
                if (json.data.lockedUntil) {
                    setLockedUntil(new Date(json.data.lockedUntil));
                } else {
                    setLockedUntil(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch locker status:", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
        checkLockerStatus();
    }, [activeWorkspace]);

    const favorites = files.filter((file) => file.isFavorite);
    const lockedFiles = files.filter((file) => file.isLocked);

    const addFile = async (file: File, isLocked: boolean = false) => {
        if (!activeWorkspace) {
            toast.error("No active workspace selected");
            return;
        }

        const reader = new FileReader();
        const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md");

        reader.onload = async (event) => {
            try {
                const fileContent = event.target?.result as string;

                const res = await fetch("/api/documents", {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        title: file.name,
                        content: fileContent || " ",
                        type: getFileType(file.name),
                        visibility: "SHARED",
                    }),
                });

                const json = await res.json();
                if (!json.success) {
                    throw new Error(json.message || "Failed to upload document");
                }

                const newDoc = json.data.document;

                if (isLocked) {
                    const lockRes = await fetch("/api/locker/documents", {
                        method: "POST",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            documentId: newDoc.id,
                        }),
                    });
                    const lockJson = await lockRes.json();
                    if (!lockJson.success) {
                        throw new Error(lockJson.message || "Failed to lock document");
                    }
                }

                toast.success(isLocked ? `"${file.name}" encrypted & saved` : `Uploaded ${file.name}`);
                await fetchDocuments();
            } catch (error: any) {
                console.error("Upload failed:", error);
                toast.error(error.message || "Upload failed");
            }
        };

        if (isText) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    };

    const toggleFavorite = (id: string) => {
        setFiles((prev) =>
            prev.map((file) => {
                if (file.id === id) {
                    const nextVal = !file.isFavorite;
                    localStorage.setItem(`fav_${id}`, String(nextVal));
                    return { ...file, isFavorite: nextVal };
                }
                return file;
            })
        );
    };

    const deleteFile = async (id: string) => {
        try {
            const res = await fetch(`/api/documents?id=${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const json = await res.json();
            if (!json.success) {
                throw new Error(json.message || "Failed to delete file");
            }
            toast.success("Document deleted successfully");
            await fetchDocuments();
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(error.message || "Delete failed");
        }
    };

    const unlockLocker = async (pin: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/locker/unlock", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ pin }),
            });
            const json = await res.json();
            if (json.success) {
                setIsLockerUnlocked(true);
                await checkLockerStatus();
                return true;
            } else {
                throw new Error(json.message || "Incorrect PIN");
            }
        } catch (error: any) {
            await checkLockerStatus();
            throw error;
        }
    };

    const setupLocker = async (pin: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/locker/setup", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ pin }),
            });
            const json = await res.json();
            if (json.success) {
                setHasLocker(true);
                setIsLockerUnlocked(true);
                await checkLockerStatus();
                return true;
            } else {
                throw new Error(json.message || "Setup failed");
            }
        } catch (error: any) {
            throw error;
        }
    };

    const lockLocker = async () => {
        try {
            await fetch("/api/locker/lock", {
                method: "POST",
                headers: getHeaders(),
            });
            setIsLockerUnlocked(false);
            await checkLockerStatus();
        } catch (error) {
            console.error("Lock failed:", error);
        }
    };

    return (
        <DashboardContext.Provider value={{
            files,
            favorites,
            lockedFiles,
            addFile,
            toggleFavorite,
            deleteFile,
            isLockerUnlocked,
            hasLocker,
            isLockerLockedOut,
            lockedUntil,
            checkLockerStatus,
            unlockLocker,
            setupLocker,
            lockLocker,
            refreshFiles: fetchDocuments
        }}>
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

function getFileType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (["doc", "docx"].includes(ext || "")) return "Word";
    if (["xls", "xlsx"].includes(ext || "")) return "Excel";
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "Image";
    return "File";
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
