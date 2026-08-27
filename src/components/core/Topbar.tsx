"use client";

import React, { memo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Languages, Moon, Sun, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationBellDropdown } from "./NotificationBellDropdown";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSetting } from "@/features/settings/hooks/useSettings";
import { Link } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { adminRoutes } from "@/config/admin-routes";

export const Topbar = memo(function Topbar() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { user, logout } = useAuth();
  const { data: activeLocalesSetting } = useSetting('ACTIVE_LOCALES', {
    en: true,
    ar: true,
    es: true,
    pt: true,
    it: true,
  });

  const availableLocales = React.useMemo(() => {
    if (!activeLocalesSetting) return LOCALES;
    if (Array.isArray(activeLocalesSetting)) {
      return LOCALES.filter((l) => activeLocalesSetting.includes(l.code));
    }
    if (typeof activeLocalesSetting === 'object') {
      const activeMap = activeLocalesSetting as Record<string, boolean>;
      const filtered = LOCALES.filter((l) => activeMap[l.code] !== false);
      return filtered.length > 0 ? filtered : LOCALES;
    }
    return LOCALES;
  }, [activeLocalesSetting]);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");
  const tNav = useTranslations("navigation");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = (params?.locale as string) || "ar";

  const handleLanguageChange = (newLocale: string) => {
    const searchString = searchParams ? searchParams.toString() : "";
    const target = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(target, { locale: newLocale });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      const first = pathname.split('/').filter(Boolean)[0];
      const validLocale = ['en', 'ar', 'es', 'pt', 'it'].includes(first) ? first : 'ar';
      window.location.href = `/${validLocale}/login`;
    }
  };

  const isDark = mounted && theme === "dark";

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header
      className="h-16 border-b border-border px-3 sm:px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 bg-card transition-colors duration-200"
    >
      {/* Left: Sidebar Trigger */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <SidebarTrigger className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/60" />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">

        {/* Desktop Search */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
          }}
          aria-label={tAccess("searchDashboard")}
          className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 px-3 py-1.5 rounded-xl w-44 transition-all duration-200"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="truncate">{tCommon("searchPlaceholder")}</span>
          <kbd className="ms-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Mobile Quick Search */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
          }}
          title="Search"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme Toggle Button — light background in light mode */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 rounded-xl bg-amber-500/10 dark:bg-slate-900 border border-amber-500/30 dark:border-slate-800 hover:border-amber-500/50 text-amber-600 dark:text-amber-400 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
          title={isDark ? "التحويل للوضع الفاتح (Light Mode)" : "التحويل للوضع الداكن (Dark Mode)"}
        >
          {isDark ? (
            <>
              <Sun size={17} className="text-amber-400 animate-pulse" />
              <span className="hidden md:inline text-slate-200 text-[11px]">الوضع الفاتح</span>
            </>
          ) : (
            <>
              <Moon size={17} className="text-indigo-600" />
              <span className="hidden md:inline text-slate-700 text-[11px]">الوضع الداكن</span>
            </>
          )}
        </button>

        {/* 5-Language Switcher — light background in light mode */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-1.5 sm:px-2 py-1 shrink-0 hover:border-amber-500/40 transition-colors">
          <Languages size={15} className="text-amber-600 dark:text-amber-400 mx-0.5 sm:mx-1 shrink-0" />
          <select
            value={currentLocale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-22.5 sm:max-w-none"
          >
            {availableLocales.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-card text-foreground">
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <NotificationBellDropdown />
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-1.5 rounded-xl hover:border-amber-500/40 transition-colors shrink-0 cursor-pointer"
            >
              <Avatar className="w-7 h-7 ring-1 ring-amber-500/50">
                <AvatarImage src="" alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-amber-500/20 text-amber-600 dark:text-amber-300 font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-800 dark:text-white block leading-none">{user?.name || "Attia Yamany"}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Super Admin</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-card border-border text-foreground shadow-lg"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground">{user?.name || "Attia Yamany"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@dunastravel.com"}</p>
                <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Super Admin</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={adminRoutes.profile} className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{tNav("profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={adminRoutes.settings} className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>{tNav("settings")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>{tNav("logOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
