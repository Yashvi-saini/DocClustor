"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";

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
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const { workspaces, activeWorkspace, switchWorkspace, isLoading } = useWorkspace();

  const basePath = activeWorkspace?.type === "org" ? "/company" : "/individual";
  const sidebarItems = getSidebarItems(basePath);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setShowWorkspaceDropdown(false);
    }
  };

  const handleWorkspaceSelect = (id: string) => {
    switchWorkspace(id);
    setShowWorkspaceDropdown(false);
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-[#003259] text-white transition-all duration-300 ease-in-out font-poppins z-30 shadow-2xl",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center justify-center h-20 border-b border-white/10 shrink-0">
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

      <div className="relative px-3 py-4 border-b border-white/10 shrink-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        ) : activeWorkspace ? (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setShowWorkspaceDropdown(true);
                } else {
                  setShowWorkspaceDropdown(!showWorkspaceDropdown);
                }
              }}
              className={cn(
                "flex items-center w-full rounded-lg p-2 transition-all hover:bg-white/10 text-left focus:outline-none",
                showWorkspaceDropdown && "bg-white/15"
              )}
            >
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E9BFF] to-[#0074D9] font-bold text-white shadow-md text-sm">
                  {activeWorkspace.name.substring(0, 2).toUpperCase()}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate leading-tight text-white">
                      {activeWorkspace.name}
                    </p>
                    <p className="text-[10px] text-white/60 truncate uppercase tracking-wider mt-0.5">
                      {activeWorkspace.type === "personal" ? "Personal Space" : "Org Space"}
                    </p>
                  </div>
                )}

                {!isCollapsed && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform text-white/60",
                      showWorkspaceDropdown && "rotate-180"
                    )}
                  />
                )}
              </div>
            </button>

            {!isCollapsed && showWorkspaceDropdown && (
              <div className="absolute top-[calc(100%-8px)] left-3 right-3 mt-2 bg-[#002440] border border-white/10 rounded-lg shadow-xl py-2 z-40 max-h-[220px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-1 font-bold">
                  Switch Workspace
                </p>
                {workspaces.map((w) => {
                  const isSelected = w.id === activeWorkspace.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleWorkspaceSelect(w.id)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-left hover:bg-white/5 transition-colors text-sm",
                        isSelected && "bg-white/10 font-bold"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded bg-white/10 text-[10px] font-bold text-white uppercase">
                          {w.name.substring(0, 2)}
                        </div>
                        <div className="truncate">
                          <p className="truncate text-white text-xs">{w.name}</p>
                          <p className="text-[9px] text-white/50 capitalize">
                            {w.type === "personal" ? "Personal" : "Organization"}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4.5 h-4.5 shrink-0 text-[#1E9BFF]" />}
                    </button>
                  );
                })}

                <div className="border-t border-white/10 mt-2 pt-2 px-2">
                  <Link href="/company/setup" onClick={() => setShowWorkspaceDropdown(false)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-white/80 hover:text-white hover:bg-white/10 justify-start gap-2 h-8"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Org
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar shrink-0">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group w-full text-left",
            "hover:bg-white/10 text-white"
          )}
        >
          <Image
            src={isCollapsed ? "/dashboard/opensidebar.svg" : "/dashboard/closesidebar.svg"}
            alt={isCollapsed ? "Open" : "Close"}
            width={22}
            height={22}
            className="shrink-0"
          />
          {!isCollapsed && (
            <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              Collapse Sidebar
            </span>
          )}
        </button>

        <div className="pt-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group w-full text-left",
                  isActive
                    ? "bg-[#335B7A] font-bold text-white shadow-inner"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                )}
              >
                <div className="relative w-5 h-5 shrink-0">
                  <Image src={item.iconPath} alt={item.label} fill className="object-contain" />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <Button
          className={cn(
            "w-full bg-[#1E9BFF] hover:bg-[#1E9BFF]/85 text-white font-bold transition-all shadow-lg shadow-blue-500/20",
            isCollapsed ? "px-0 justify-center" : "gap-2"
          )}
        >
          {isCollapsed ? <Plus size={24} /> : <><Plus size={20} /> Upload Doc</>}
        </Button>
      </div>
    </aside>
  );
}
