"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WorkspaceListItem } from "@backend/types/api.types";
import toast from "react-hot-toast";

interface WorkspaceContextType {
  workspaces: WorkspaceListItem[];
  activeWorkspace: WorkspaceListItem | null;
  isLoading: boolean;
  switchWorkspace: (workspaceId: string, customTarget?: WorkspaceListItem) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Helper to get cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper to set cookie
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      const data = await res.json();
      if (data.success && data.data?.workspaces) {
        const list: WorkspaceListItem[] = data.data.workspaces;
        setWorkspaces(list);

        // Determine which workspace should be active
        const cookieWspId = getCookie("workspace_id");
        let active = list.find((w) => w.id === cookieWspId);

        if (!active && list.length > 0) {
          // Default to personal workspace if available, or first workspace
          active = list.find((w) => w.type === "personal") || list[0];
          setCookie("workspace_id", active.id);
        }

        // Only update state if activeWorkspace has changed to prevent infinite loops
        setActiveWorkspace((prev) => {
          if (!active) return null;
          if (prev && prev.id === active.id) return prev; // preserve reference
          return active;
        });
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch workspaces if user is logged in (not on login/signup/onboarding routes)
    const publicRoutes = ["/login", "/signup", "/verify", "/forgot-password", "/reset-password"];
    const isOnPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route));

    if (!isOnPublicRoute && pathname !== "/onboarding") {
      if (!hasFetched) {
        fetchWorkspaces();
        setHasFetched(true);
      }
    } else {
      setIsLoading(false);
      setHasFetched(false); // Reset when navigating to public/onboarding routes
    }
  }, [pathname, hasFetched]);

  const switchWorkspace = useCallback((workspaceId: string, customTarget?: WorkspaceListItem) => {
    const target = customTarget || workspaces.find((w) => w.id === workspaceId);
    if (!target) {
      toast.error("Selected workspace not found");
      return;
    }

    setIsLoading(true);
    setCookie("workspace_id", target.id);
    setActiveWorkspace(target);

    // Show dynamic success toast
    toast.success(`Switched to ${target.name}`);

    // Determine target dashboard path based on workspace type
    const targetPath = target.type === "personal" ? "/individual/home" : "/company/home";
    
    // Redirect user to the homepage of their newly selected workspace
    router.push(targetPath);
    setIsLoading(false);
  }, [workspaces, router]);

  const contextValue = useMemo(() => ({
    workspaces,
    activeWorkspace,
    isLoading,
    switchWorkspace,
    refreshWorkspaces: fetchWorkspaces,
  }), [workspaces, activeWorkspace, isLoading, switchWorkspace, fetchWorkspaces]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
