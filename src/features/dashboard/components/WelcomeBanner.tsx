"use client";

import React from "react";
import { Crown, Globe2, ShieldCheck, Layers } from "lucide-react";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WelcomeBanner() {
  return (
    <div className="welcome-banner-card relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl text-white">
      {/* Background Subtle Highlights */}
      <div className="absolute -top-24 -inset-e-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -inset-s-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Description */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
            <Crown size={14} className="animate-bounce" />
            <span>أهلاً بك أستاذ Attia Yamany • المدير العام</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            <span className="text-amber-400 font-bold">
              Dunas Travel Suite 👑
            </span>
          </h1>

          <p className="welcome-banner-desc text-amber-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-semibold">
            منصة مستقلة للتحكم الكامل ببيانات موقع Dunas Travel، إدارة 8 واجهات سياحية، البرامج الفاخرة، الحجوزات، الرسائل، والإشعارات المباشرة باللغات الخمس (العربية، الإسبانية، البرتغالية، الإنجليزية، الإيطالية).
          </p>

          {/* 5 Languages & Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-100 font-bold me-1 flex items-center gap-1">
              <Globe2 size={14} className="text-amber-400" /> دعم 5 لغات:
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🇸🇦</span> العربية
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🇪🇸</span> الإسبانية
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🇵🇹</span> البرتغالية
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🇬🇧</span> الإنجليزية
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🇮🇹</span> الإيطالية
            </span>
          </div>
        </div>

        {/* Right Column: Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href={adminRoutes.bookings}
            className={cn(
              buttonVariants({ variant: "gold" }),
              "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-xs px-5 py-2.5 h-auto rounded-xl gap-2 cursor-pointer"
            )}
          >
            <ShieldCheck size={16} />
            <span>إدارة الحجوزات والمبيعات</span>
          </Link>

          <Link
            href={adminRoutes.destinations}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-white hover:text-amber-400 text-xs px-5 py-2.5 h-auto rounded-xl gap-2 cursor-pointer"
            )}
          >
            <Layers size={16} className="text-amber-400" />
            <span>الوجهات السياحية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
