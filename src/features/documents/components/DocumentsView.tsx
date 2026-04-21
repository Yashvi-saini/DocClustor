"use client";

import React, { useState, useMemo } from "react";
import { 
    Search, Filter, List, LayoutGrid, Download, Eye, Trash2, 
    MoreVertical, FileText, FileSpreadsheet, File as FileIcon, 
    Image as ImageIcon, UploadCloud, FolderPlus, Lock 
} from "lucide-react";
import { format } from "date-fns";
import { useDashboard, FileItem } from "../../dashboard/context/DashboardContext";
import toast from "react-hot-toast";

type ViewMode = "list" | "grid";
type FilterType = "All files" | "PDF" | "Word" | "Excel" | "Image";

function FileBadge({ type }: { type: string }) {
    const map: Record<string, { bg: string; text: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
        PDF:   { bg: "bg-red-50",    text: "text-red-500",    Icon: FileText },
        Word:  { bg: "bg-blue-50",   text: "text-blue-500",   Icon: FileIcon },
        Excel: { bg: "bg-green-50",  text: "text-green-500",  Icon: FileSpreadsheet },
        Image: { bg: "bg-purple-50", text: "text-purple-500", Icon: ImageIcon },
    };
    const { bg, text, Icon } = map[type] ?? { bg: "bg-gray-100", text: "text-gray-500", Icon: FileIcon };
    return <div className={`p-2.5 ${bg} rounded-xl`}><Icon size={22} className={text} /></div>;
}

export interface DocumentsViewProps {
    title?: string;
    description?: string;
}

export function DocumentsView({ 
    title = "Documents", 
    description = "Manage, organize, and access all your files." 
}: DocumentsViewProps) {
    const { files, deleteFile, addFile } = useDashboard();
    
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("All files");

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Only show unlocked files
    const allFiles = files.filter(f => !f.isLocked);

    const filteredFiles = useMemo(() => {
        return allFiles.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "All files" || f.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [allFiles, searchQuery, filterType]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addFile(file, false);
            toast.success(`"${file.name}" uploaded successfully`);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

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

    const filterOptions: FilterType[] = ["All files", "PDF", "Word", "Excel", "Image"];

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* ── Header & Upload ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#001D3D] font-poppins mb-1">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {description}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-max">
                        <FolderPlus size={18} className="text-gray-400" />
                        New Folder
                    </button>
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#018FFF] hover:bg-[#007AE6] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm min-w-max"
                    >
                        <UploadCloud size={18} />
                        Upload File
                    </button>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#018FFF]/20 focus:border-[#018FFF] transition-all"
                        />
                    </div>
                    
                    <div className="hidden sm:block w-[1px] h-6 bg-gray-200" />

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto mask-fade-edges">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setFilterType(opt)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                                    filterType === opt
                                        ? "bg-[#018FFF] text-white shadow-sm"
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex items-center gap-1.5 hidden sm:flex border border-gray-200 p-1 rounded-lg bg-gray-50">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                        title="List View"
                    >
                        <List size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                </div>
                
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1">
                {filteredFiles.length === 0 ? (
                    <div className="h-64 sm:h-[400px] flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-xl">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                            <Search size={28} />
                        </div>
                        <h3 className="text-gray-800 font-bold mb-1">No files found</h3>
                        <p className="text-gray-400 text-sm max-w-[250px] text-center">
                            {searchQuery || filterType !== "All files" 
                                ? "Try adjusting your search or filters to find what you're looking for." 
                                : "Upload your first file to see it appear here."}
                        </p>
                    </div>
                ) : viewMode === "list" ? (
                    // ── List View ──
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4 rounded-tl-xl">File Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Size</th>
                                        <th className="px-6 py-4">Date Modified</th>
                                        <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map((file, idx) => (
                                        <tr 
                                            key={file.id} 
                                            className={`group hover:bg-gray-50/50 transition-colors ${idx !== filteredFiles.length - 1 ? 'border-b border-gray-50' : ''}`}
                                        >
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <FileBadge type={file.type} />
                                                    <span className="font-semibold text-gray-800 text-sm">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-gray-100 text-gray-500">
                                                    {file.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-500 font-medium">
                                                {file.size}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                {format(file.createdAt, "dd MMM yyyy, HH:mm")}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handlePreview(file)} className="p-2 text-gray-400 hover:text-[#018FFF] hover:bg-[#018FFF]/10 rounded-md transition-all" title="Preview">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => handleDownload(file)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all" title="Download">
                                                        <Download size={16} />
                                                    </button>
                                                    <button onClick={() => { deleteFile(file.id); toast.success("File deleted"); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // ── Grid View ──
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredFiles.map((file) => (
                            <div 
                                key={file.id} 
                                className="group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#018FFF]/30 transition-all flex flex-col"
                            >
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-700 bg-white rounded-md shadow-sm border border-gray-100">
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                                <div className="h-24 bg-gray-50/50 rounded-lg border border-gray-50 flex items-center justify-center mb-4 mt-2">
                                    <FileBadge type={file.type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate mb-1" title={file.name}>
                                        {file.name}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 font-semibold mb-3">
                                        {format(file.createdAt, "MMM dd, yyyy")} • {file.size}
                                    </p>
                                </div>
                                
                                {/* Grid view actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                                    <button onClick={() => handlePreview(file)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                                        <Eye size={12} /> View
                                    </button>
                                    <div className="w-[1px] h-3 bg-gray-200" />
                                    <button onClick={() => handleDownload(file)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                                        <Download size={12} /> Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
