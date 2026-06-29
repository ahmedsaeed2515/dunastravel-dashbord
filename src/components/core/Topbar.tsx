"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function Topbar() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="h-16 border-b border-white/5 dark:border-white/5 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 z-20 sticky top-0 flex items-center justify-between px-6 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent/50 text-foreground transition-all duration-300" />
        
        {/* Global Search Trigger (Cmd+K) */}
        <button className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border px-4 py-2 rounded-full w-64 transition-all duration-300">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-full hover:bg-muted/80 text-foreground transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-muted/80 text-foreground transition-all duration-300 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background"></span>
        </button>
      </div>
    </header>
  );
}
