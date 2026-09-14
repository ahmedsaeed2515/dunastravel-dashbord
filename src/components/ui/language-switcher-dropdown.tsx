"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { CountryFlag } from "./country-flag";

const availableLocales = [
  { code: "ar", label: "العربية", flag: "🇪🇬" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export function LanguageSwitcherDropdown({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const currentLocale = (params?.locale as string) || "en";
  const currentLang = availableLocales.find((l) => l.code === currentLocale) || availableLocales[1];

  const handleSelect = (newLocale: string) => {
    setOpen(false);
    if (newLocale === currentLocale) return;
    const searchString = searchParams ? searchParams.toString() : "";
    const target = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(target, { locale: newLocale });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block text-start ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-8 px-3 rounded-full flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/50 text-slate-200 text-xs font-semibold backdrop-blur-md transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CountryFlag code={currentLang.code} fallbackEmoji={currentLang.flag} className="w-5 h-3.5 shadow-sm" />
        <span>{currentLang.label}</span>
        <ChevronDown size={12} className={`text-amber-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full end-0 mt-2 w-44 rounded-2xl p-1.5 bg-slate-950/95 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl z-50 transition-all select-none"
        >
          {availableLocales.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CountryFlag code={lang.code} fallbackEmoji={lang.flag} className="w-5 h-3.5 shadow-sm" />
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check size={12} className="text-amber-400" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcherDropdown;
