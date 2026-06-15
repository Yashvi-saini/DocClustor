"use client";

import React from "react";
import { FileText, Lock, Eye, Download, FileSpreadsheet, File as FileIcon, List, LayoutGrid, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard, FileItem } from "../context/DashboardContext";
import { LockerPinModal } from "../../locker/components/LockerPinModal";
import toast from "react-hot-toast";

export function RecentFilesSection() {
    const { files, isLoadingFiles, toggleFavorite, deleteFile, isLockerUnlocked, getFileBlobUrl } = useDashboard();
    const [pinModalOpen, setPinModalOpen] = React.useState(false);
    const [pendingAction, setPendingAction] = React.useState<{ file: FileItem; type: 'preview' | 'download' } | null>(null);
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');

    const executeAction = async (file: FileItem, type: 'preview' | 'download') => {
        try {
            const url = await getFileBlobUrl(file);
            if (type === 'preview') {
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Download started");
            }
        } catch (e) {
            console.error("Action execution failed:", e);
        }
    };

    const handleDownload = (file: FileItem) => {
        if (file.isLocked && !isLockerUnlocked) {
            setPendingAction({ file, type: 'download' });
            setPinModalOpen(true);
        } else {
            executeAction(file, 'download');
        }
    };

    const handlePreview = (file: FileItem) => {
        if (file.isLocked && !isLockerUnlocked) {
            setPendingAction({ file, type: 'preview' });
            setPinModalOpen(true);
        } else {
            executeAction(file, 'preview');
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case "PDF":
                return <div className="p-2 bg-red-100 rounded-lg"><FileText className="text-red-500" size={20} /></div>;
            case "Word":
                return <div className="p-2 bg-blue-100 rounded-lg"><FileIcon className="text-blue-500" size={20} /></div>;
            case "Excel":
                return <div className="p-2 bg-green-100 rounded-lg"><FileSpreadsheet className="text-green-500" size={20} /></div>;
            case "Image":
                return <div className="p-2 bg-purple-100 rounded-lg"><ImageIcon className="text-purple-500" size={20} /></div>;
            default:
                return <div className="p-2 bg-gray-100 rounded-lg"><FileIcon className="text-gray-500" size={20} /></div>;
        }
    };

    const [currentPage, setCurrentPage] = React.useState(1);
    const FILES_PER_PAGE = 5;

    const totalPages = Math.ceil(files.length / FILES_PER_PAGE);
    const startIndex = (currentPage - 1) * FILES_PER_PAGE;
    const currentFiles = files.slice(startIndex, startIndex + FILES_PER_PAGE);


    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [files.length, currentPage, totalPages]);


    if (isLoadingFiles) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-poppins text-black">Recents</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
                <div className="space-y-3 pb-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-32 sm:w-48 bg-gray-100 rounded" />
                                    <div className="h-3 w-20 bg-gray-50 rounded" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full" />
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                                    <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                                </div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="w-full text-center p-8 text-gray-500 bg-white rounded-xl">
                No recent files. Upload something to get started!
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-poppins text-black">Recents</h2>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'text-[#018FFF] bg-[#018FFF]/10' : 'text-gray-400 hover:text-gray-600'}
                    >
                        <List size={20} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'text-[#018FFF] bg-[#018FFF]/10' : 'text-gray-400 hover:text-gray-600'}
                    >
                        <LayoutGrid size={20} />
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-3 pb-4">
                    {currentFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="flex items-center gap-4">
                                {getFileIcon(file.type)}
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">{file.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {file.type} • {file.isLocked ? "Locked" : file.size}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleFavorite(file.id)}
                                    className={file.isFavorite ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}
                                >
                                    <Star fill={file.isFavorite ? "currentColor" : "none"} size={18} />
                                </Button>

                                {file.isLocked && <Lock size={16} className="text-gray-400" />}

                                <div className="hidden sm:flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handlePreview(file)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-8 text-xs font-medium gap-1"
                                    >
                                        <Eye size={14} /> View
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-8 text-xs font-medium gap-1"
                                    >
                                        <Download size={14} /> Download
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteFile(file.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                    {currentFiles.map((file) => (
                        <div 
                            key={file.id} 
                            className="group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#018FFF]/30 transition-all flex flex-col"
                        >
                            <div className="flex items-center justify-between w-full mb-3">
                                <div className="flex items-center gap-2">
                                    {file.isLocked && <Lock size={15} className="text-gray-400 shrink-0" />}
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleFavorite(file.id)}
                                        className={`h-8 w-8 rounded-lg ${file.isFavorite ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                                    >
                                        <Star fill={file.isFavorite ? "currentColor" : "none"} size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => deleteFile(file.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm truncate" title={file.name}>
                                    {file.name}
                                </h3>
                                <p className="text-[11px] text-gray-400 font-semibold">
                                    {file.type} • {file.isLocked ? "Locked" : file.size}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handlePreview(file)}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 h-8 text-xs font-semibold gap-1"
                                >
                                    <Eye size={12} /> View
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleDownload(file)}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 h-8 text-xs font-semibold gap-1"
                                >
                                    <Download size={12} /> Save
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-3"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <LockerPinModal 
                isOpen={pinModalOpen}
                onClose={() => {
                    setPinModalOpen(false);
                    setPendingAction(null);
                }}
                onSuccess={() => {
                    if (pendingAction) {
                        executeAction(pendingAction.file, pendingAction.type);
                    }
                }}
            />
        </div>
    );
}
