"use client";

import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-collapsed";

type SidebarContextValue = {
  isCollapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, []);

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarLayout({ children }: { children: ReactNode }) {
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.isCollapsed ?? false;

  return (
    <div
      className={cn(
        "min-h-dvh bg-background transition-[padding] duration-300 ease-in-out",
        isCollapsed ? "md:pl-[4.5rem]" : "md:pl-72",
      )}
    >
      {children}
    </div>
  );
}
