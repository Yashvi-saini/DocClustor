"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from "react";
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

export interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    dob?: string;
    role?: string;
    joinedDate?: string;
}

interface DashboardContextType {
    files: FileItem[];
    isLoadingFiles: boolean;
    favorites: FileItem[];
    lockedFiles: FileItem[];
    addFile: (file: File, isLocked?: boolean) => Promise<void>;
    toggleFavorite: (id: string) => void;
    deleteFile: (id: string) => Promise<void>;
    getFileBlobUrl: (file: FileItem) => Promise<string>;
    
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
    sendResetLockerPinOtp: () => Promise<boolean>;
    verifyAndResetLockerPin: (otp: string, pin: string) => Promise<boolean>;

    // User profile states & methods
    userProfile: UserProfile | null;
    fetchUserProfile: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const { activeWorkspace } = useWorkspace();

    // Locker state variables
    const [isLockerUnlocked, setIsLockerUnlocked] = useState(false);
    const [hasLocker, setHasLocker] = useState(false);
    const [isLockerLockedOut, setIsLockerLockedOut] = useState(false);
    const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

    // User profile state
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const loadingPromisesRef = useRef<Map<string, Promise<string>>>(new Map());
    const localBlobUrlsRef = useRef<Map<string, string>>(new Map());

    const getHeaders = useCallback(() => {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (activeWorkspace) {
            headers["X-Workspace-Context"] = activeWorkspace.type === "personal" ? "personal" : `org:${activeWorkspace.id}`;
        }
        return headers;
    }, [activeWorkspace]);

    const fetchDocuments = useCallback(async () => {
        if (!activeWorkspace) {
            setIsLoadingFiles(false);
            return;
        }
        setIsLoadingFiles(true);
        try {
            const res = await fetch("/api/documents", {
                headers: getHeaders(),
            });
            const json = await res.json();
            if (json.success && json.data?.documents) {
                const mapped: FileItem[] = json.data.documents.map((doc: any) => {
                    const localUrl = localBlobUrlsRef.current.get(doc.id);
                    return {
                        id: doc.id,
                        name: doc.title,
                        type: doc.type,
                        size: doc.fileSize ? formatFileSize(Number(doc.fileSize)) : "0 Bytes",
                        url: doc.fileUrl || localUrl || "",
                        createdAt: new Date(doc.createdAt),
                        isFavorite: localStorage.getItem(`fav_${doc.id}`) === "true",
                        isLocked: doc.lockerId !== null,
                    };
                });
                setFiles((prev) => {
                    const urlMap = new Map(prev.map(f => [f.id, f.url]));
                    return mapped.map(item => ({
                        ...item,
                        url: item.url || urlMap.get(item.id) || ""
                    }));
                });
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [activeWorkspace, getHeaders]);

    const fetchFileContent = useCallback(async (fileId: string) => {
        try {
            const res = await fetch(`/api/documents/${fileId}`, {
                headers: getHeaders(),
            });
            const json = await res.json();
            if (json.success && json.data?.content) {
                return json.data.content;
            }
            throw new Error(json.message || "Failed to load file content");
        } catch (error: any) {
            console.error("fetchFileContent failed:", error);
            throw error;
        }
    }, [getHeaders]);

    const getFileBlobUrl = useCallback(async (file: FileItem) => {
        if (file.url) return file.url;

        // Check if we have a locally created blob URL from upload
        const localUrl = localBlobUrlsRef.current.get(file.id);
        if (localUrl) {
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, url: localUrl } : f));
            return localUrl;
        }

        // If there's an ongoing fetch for this file, return the existing promise
        const existingPromise = loadingPromisesRef.current.get(file.id);
        if (existingPromise) {
            return existingPromise;
        }

        const promise = (async () => {
            const toastId = toast.loading(`Loading content for "${file.name}"...`);
            try {
                const content = await fetchFileContent(file.id);
                let blobUrl = "";

                if (content.startsWith("data:")) {
                    // Use browser's native async base64 decoding (100x faster than manual loops)
                    const response = await fetch(content);
                    const blob = await response.blob();
                    blobUrl = URL.createObjectURL(blob);
                } else {
                    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                    blobUrl = URL.createObjectURL(blob);
                }

                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, url: blobUrl } : f));
                toast.dismiss(toastId);
                return blobUrl;
            } catch (error: any) {
                toast.error(error.message || "Failed to load content", { id: toastId });
                throw error;
            } finally {
                loadingPromisesRef.current.delete(file.id);
            }
        })();

        loadingPromisesRef.current.set(file.id, promise);
        return promise;
    }, [fetchFileContent]);

    const checkLockerStatus = useCallback(async () => {
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
    }, [activeWorkspace, getHeaders]);

    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/users/me");
            const json = await res.json();
            if (json.success && json.data?.user) {
                const u = json.data.user;
                setUserProfile({
                    name: u.name || "User",
                    email: u.email || "",
                    avatar: u.avatar || "",
                    phone: u.phone || "",
                    dob: u.dob || "",
                    role: u.role || "Individual Creator",
                    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "April 2024",
                });
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    }, []);

    const updateUserProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
        try {
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Profile updated successfully");
                await fetchUserProfile();
                return true;
            } else {
                throw new Error(json.message || "Failed to update profile");
            }
        } catch (error: any) {
            toast.error(error.message || "Update failed");
            return false;
        }
    }, [fetchUserProfile]);

    // Single initialization effect — all 3 calls fire in parallel
    useEffect(() => {
        fetchDocuments();
        checkLockerStatus();
        fetchUserProfile();
    }, [fetchDocuments, checkLockerStatus, fetchUserProfile]);

    const favorites = useMemo(() => files.filter((file) => file.isFavorite), [files]);
    const lockedFiles = useMemo(() => files.filter((file) => file.isLocked), [files]);

    const addFile = useCallback(async (file: File, isLocked: boolean = false) => {
        if (!activeWorkspace) {
            toast.error("No active workspace selected");
            return;
        }

        const MAX_SIZE = 3.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error(`"${file.name}" is too large. Maximum upload size is 3.5 MB.`);
            return;
        }

        const toastId = toast.loading(`Uploading "${file.name}"...`);
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
                        fileSize: file.size,
                        mimeType: file.type,
                    }),
                });

                const json = await res.json();
                if (!json.success) {
                    throw new Error(json.message || "Failed to upload document");
                }

                const newDoc = json.data.document;

                if (isLocked) {
                    toast.loading(`Encrypting and locking "${file.name}"...`, { id: toastId });
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

                toast.success(isLocked ? `"${file.name}" encrypted & saved` : `Uploaded ${file.name}`, { id: toastId });
                
                // Keep a local blob URL of the original file so it views instantly without any server roundtrip
                if (!isLocked) {
                    try {
                        const localUrl = URL.createObjectURL(file);
                        localBlobUrlsRef.current.set(newDoc.id, localUrl);
                    } catch (err) {
                        console.error("Failed to create local object URL:", err);
                    }
                }

                // Optimistic insert — add the file to state immediately without a full refetch
                const localUrl = localBlobUrlsRef.current.get(newDoc.id) || "";
                setFiles(prev => [{
                    id: newDoc.id,
                    name: file.name,
                    type: getFileType(file.name),
                    size: formatFileSize(file.size),
                    url: localUrl,
                    createdAt: new Date(),
                    isFavorite: false,
                    isLocked: isLocked,
                }, ...prev]);
            } catch (error: any) {
                console.error("Upload failed:", error);
                toast.error(error.message || "Upload failed", { id: toastId });
            }
        };

        if (isText) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    }, [activeWorkspace, getHeaders]);

    const toggleFavorite = useCallback((id: string) => {
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
    }, []);

    const deleteFile = useCallback(async (id: string) => {
        // Optimistic delete — remove from state instantly for snappy UX
        setFiles(prev => prev.filter(f => f.id !== id));
        
        // Clean up any cached blob URLs
        const cachedUrl = localBlobUrlsRef.current.get(id);
        if (cachedUrl) {
            try { URL.revokeObjectURL(cachedUrl); } catch (_) {}
            localBlobUrlsRef.current.delete(id);
        }

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
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(error.message || "Delete failed");
            // Rollback — refetch the real state from server
            await fetchDocuments();
        }
    }, [getHeaders, fetchDocuments]);

    const unlockLocker = useCallback(async (pin: string): Promise<boolean> => {
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
    }, [getHeaders, checkLockerStatus]);

    const setupLocker = useCallback(async (pin: string): Promise<boolean> => {
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
    }, [getHeaders, checkLockerStatus]);

    const lockLocker = useCallback(async () => {
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
    }, [getHeaders, checkLockerStatus]);

    const sendResetLockerPinOtp = useCallback(async (): Promise<boolean> => {
        try {
            const res = await fetch("/api/locker/reset-pin/send", {
                method: "POST",
                headers: getHeaders(),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(json.message || "Verification OTP sent!");
                return true;
            } else {
                throw new Error(json.message || "Failed to send verification OTP");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP");
            throw error;
        }
    }, [getHeaders]);

    const verifyAndResetLockerPin = useCallback(async (otp: string, pin: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/locker/reset-pin/verify", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ otp, pin }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("PIN reset successfully! Locker unlocked.");
                setIsLockerUnlocked(true);
                await checkLockerStatus();
                return true;
            } else {
                throw new Error(json.message || "Failed to reset PIN");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to reset PIN");
            throw error;
        }
    }, [getHeaders, checkLockerStatus]);

    const contextValue = useMemo(() => ({
        files,
        isLoadingFiles,
        favorites,
        lockedFiles,
        addFile,
        toggleFavorite,
        deleteFile,
        getFileBlobUrl,
        isLockerUnlocked,
        hasLocker,
        isLockerLockedOut,
        lockedUntil,
        checkLockerStatus,
        unlockLocker,
        setupLocker,
        lockLocker,
        refreshFiles: fetchDocuments,
        userProfile,
        fetchUserProfile,
        updateUserProfile,
        sendResetLockerPinOtp,
        verifyAndResetLockerPin,
    }), [
        files,
        isLoadingFiles,
        favorites,
        lockedFiles,
        addFile,
        toggleFavorite,
        deleteFile,
        getFileBlobUrl,
        isLockerUnlocked,
        hasLocker,
        isLockerLockedOut,
        lockedUntil,
        checkLockerStatus,
        unlockLocker,
        setupLocker,
        lockLocker,
        fetchDocuments,
        userProfile,
        fetchUserProfile,
        updateUserProfile,
        sendResetLockerPinOtp,
        verifyAndResetLockerPin,
    ]);

    return (
        <DashboardContext.Provider value={contextValue}>
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
    if (["doc", "docx"].includes(ext || "")) return "DOCX";
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "IMAGE";
    return "TEXT";
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
