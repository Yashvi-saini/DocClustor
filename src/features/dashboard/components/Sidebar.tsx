"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
    label: string;
    iconPath: string;
    href: string;
}

const getSidebarItems = (basePath: string): SidebarItem[] => [
    { label: "Home", iconPath: "/dashboard/home.svg", href: `${basePath}/home` },
    { label: "Locker", iconPath: "/dashboard/locker.svg", href: `${basePath}/locker` },
    { label: "Documents", iconPath: "/dashboard/documents.svg", href: `${basePath}/documents` },
    { label: "RAG Bot", iconPath: "/dashboard/bot.svg", href: `${basePath}/rag-bot` },
    { label: "Profile", iconPath: "/dashboard/profile.svg", href: `${basePath}/profile` },
    { label: "Settings", iconPath: "/dashboard/settings.svg", href: `${basePath}/settings` },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true);

    // base path detect
    const basePath = pathname?.startsWith("/company") ? "/company" : "/individual";
    const sidebarItems = getSidebarItems(basePath);
    
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <aside
            className={cn(
                "relative flex flex-col h-screen bg-[#003259] text-white transition-all duration-300 ease-in-out font-poppins",
                isCollapsed ? "w-[80px]" : "w-[240px]"
            )}
        >
            {/* main logo*/}
            <div className="flex items-center justify-center h-20 border-b border-white/10">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image src="/logo(1).svg" alt="Logo" fill className="object-contain" priority />
                        </div>
                        <div className="relative w-28 h-18">
                            <Image src="/DocClustor(1).svg" alt="DocClustor" fill className="object-contain" priority />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-8 h-8">
                        <Image src="/logo(1).svg" alt="DocClustor" fill className="object-contain" priority />
                    </div>
                )}
            </div>
            {/*sidebar-toggler*/}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group w-full text-left",
                        "hover:bg-white/10 text-white"
                    )}
                >
                    <Image
                        src={isCollapsed ? "/dashboard/opensidebar.svg" : "/dashboard/closesidebar.svg"}
                        alt={isCollapsed ? "Open" : "Close"} width={22} height={22} className="shrink-0"
                    />
                    {!isCollapsed && (
                        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            Close
                        </span>
                    )}
                </button>

                {/* sidebaritems*/}

                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label} href={item.href} title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg  group w-full text-left",
                                isActive ? "bg-[#335B7A] font-bold" : "hover:bg-white/10 text-white"
                            )}
                        >
                            <Image src={item.iconPath} alt={item.label} width={20} height={20} className={cn("shrink-0")} />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
            {/*upload button*/}
            <div className="p-4 border-t border-white/10">
                <Button
                    className={cn(
                        "w-full bg-[#018FFF] hover:bg-[#018FFF]/60 text-white font-bold transition-all shadow-lg shadow-blue-500/20",
                        isCollapsed ? "px-0 justify-center" : "gap-2"
                    )}
                >
                    {isCollapsed ? <Plus size={30} /> : <><Plus size={30} /> Upload Doc</>}
                </Button>
            </div>

        </aside>
    );
}
