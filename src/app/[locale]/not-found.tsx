"use client";

import { Link } from "@/i18n/routing";
import { Compass, Home, Map, Users, CalendarCheck, ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function LocaleNotFound() {
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-12 animate-in fade-in duration-500">
      
      {/* Animated Golden Compass Crest */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-card to-background border border-amber-500/40 text-amber-400 shadow-2xl flex items-center justify-center">
          <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 stroke-[1.8] animate-spin" style={{ animationDuration: "20s" }} />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-500/20" />
        </div>
      </div>

      {/* Title & Badge */}
      <div className="space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-bold font-mono tracking-wider">
          <span>404</span>
          <span>•</span>
          <span>DESTINATION NOT FOUND</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {isRtl ? "الصفحة غير متوفرة أو تم نقلها" : "Page Not Found / Resource Relocated"}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isRtl
            ? "يبدو أنك سلكت مساراً غير متاح أو تم نقل الصفحة المطلوبة. يمكنك العودة إلى إحدى الوجهات الإدارية الرئيسية أدناه."
            : "The page or administrative resource you requested does not exist or has been moved. You can navigate back using the quick links below."}
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-start pt-6 max-w-xl w-full mx-auto">
        
        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className="p-4 rounded-2xl bg-card hover:bg-card/90 border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">
                {isRtl ? "لوحة التحكم المركزية" : "Admin Dashboard"}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {isRtl ? "نظرة عامة وإحصائيات" : "Overview & Analytics"}
              </div>
            </div>
          </div>
          <ArrowIcon className={`h-4 w-4 text-muted-foreground group-hover:text-amber-500 ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
        </Link>

        {/* 2. Tours */}
        <Link
          href="/admin/tours"
          className="p-4 rounded-2xl bg-card hover:bg-card/90 border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">
                {isRtl ? "الرحلات السياحية" : "Tour Programs"}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {isRtl ? "الكتالوج والبرامج" : "Luxury Catalog"}
              </div>
            </div>
          </div>
          <ArrowIcon className={`h-4 w-4 text-muted-foreground group-hover:text-amber-500 ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
        </Link>

        {/* 3. Customers CRM */}
        <Link
          href="/admin/customers"
          className="p-4 rounded-2xl bg-card hover:bg-card/90 border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">
                {isRtl ? "إدارة العملاء والـ CRM" : "CRM Customers"}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {isRtl ? "ملفات النخبة VIP" : "VIP Profiles & Notes"}
              </div>
            </div>
          </div>
          <ArrowIcon className={`h-4 w-4 text-muted-foreground group-hover:text-amber-500 ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
        </Link>

        {/* 4. Bookings */}
        <Link
          href="/admin/bookings"
          className="p-4 rounded-2xl bg-card hover:bg-card/90 border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">
                {isRtl ? "سجل الحجوزات" : "Bookings & Operations"}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {isRtl ? "العمليات والمدفوعات" : "Ledgers & Status"}
              </div>
            </div>
          </div>
          <ArrowIcon className={`h-4 w-4 text-muted-foreground group-hover:text-amber-500 ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
        </Link>
      </div>

    </div>
  );
}
