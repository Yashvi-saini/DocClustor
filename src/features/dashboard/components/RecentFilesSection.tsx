"use client";

import React from "react";
import { FileText, Lock, Eye, Download, FileSpreadsheet, File as FileIcon, List, LayoutGrid, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard, FileItem } from "../context/DashboardContext";
import toast from "react-hot-toast";

export function RecentFilesSection() {
    const { files, toggleFavorite, deleteFile } = useDashboard();

    const handleDownload = (file: FileItem) => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
    };

    const handlePreview = (file: FileItem) => {
        window.open(file.url, '_blank');
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
                {/* View toggles can be functional later */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-blue-500"><List size={20} /></Button>
                    <Button variant="ghost" size="icon" className="text-gray-400"><LayoutGrid size={20} /></Button>
                </div>
            </div>

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

                            {/* Mobile Actions / Delete */}
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
        </div>
    );
}
