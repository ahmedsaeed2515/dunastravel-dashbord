"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Globe, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇪🇬", dir: "rtl" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");

  const currentLocale = (params?.locale as string) || "en";
  const activeLocaleObj = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  const handleLanguageChange = (newLocale: string) => {
    const searchString = searchParams ? searchParams.toString() : "";
    const target = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(target, { locale: newLocale });
  };

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 shadow-2xs">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-muted text-foreground transition-colors p-2 rounded-md" />

        {/* Global Search Trigger (Cmd+K) */}
        <button
          type="button"
          aria-label={tAccess("searchDashboard")}
          className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border/80 px-3.5 py-1.5 rounded-full w-56 md:w-64 transition-all duration-200"
        >
          <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{tCommon("searchPlaceholder")}</span>
          <kbd className="ms-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 5-Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium px-2.5 h-9">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold uppercase">{currentLocale}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">({activeLocaleObj.flag})</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {LOCALES.map((loc) => (
              <DropdownMenuItem
                key={loc.code}
                onClick={() => handleLanguageChange(loc.code)}
                className="flex items-center justify-between cursor-pointer py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{loc.flag}</span>
                  <span className={loc.code === "ar" ? "font-semibold" : ""}>{loc.label}</span>
                </div>
                {currentLocale === loc.code && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={tCommon("toggleTheme")}
          aria-label={tAccess("toggleTheme")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{tCommon("toggleTheme")}</span>
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="relative" 
          title={tCommon("notifications")}
          aria-label={tAccess("notifications")}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-background"></span>
        </Button>
      </div>
    </header>
  );
}
