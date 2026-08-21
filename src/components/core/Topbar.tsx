"use client";

import React, { memo } from "react";
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
import { NotificationBellDropdown } from "./NotificationBellDropdown";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇪🇬", dir: "rtl" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Link } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

export const Topbar = memo(function Topbar() {
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");
  const tNav = useTranslations("navigation");

  const currentLocale = (params?.locale as string) || "en";
  const activeLocaleObj = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  const handleLanguageChange = (newLocale: string) => {
    const searchString = searchParams ? searchParams.toString() : "";
    const target = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(target, { locale: newLocale });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(currentLocale) ? currentLocale : 'ar';
      window.location.href = `/${validLocale}/login`;
    }
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="hover:bg-muted text-foreground transition-colors p-2 rounded-md" />

        {/* Mobile Brand Logo */}
        <Link href={pathname} className="sm:hidden flex items-center gap-2 font-bold text-xs">
          <img src="/dunas-travel-logo.png" alt="Dunas Travel" className="h-9 w-auto object-contain shrink-0" />
        </Link>

        {/* Desktop Global Search Trigger (Cmd+K) */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
          }}
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

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Quick Search Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
          }}
          title="Search"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
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
        <NotificationBellDropdown />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0.5 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name || "Super Admin"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@dunastravel.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/profile" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>{tNav("settings")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span>{tNav("logOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
