"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTour } from "@/features/tours/hooks/useTours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ArrowLeft, Globe, Monitor, Tablet, Smartphone, Edit,
  CheckCircle2, Clock, Users, Tag, MapPin, Check, X, ShieldAlert
} from "lucide-react";

const LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية (Arabic)", dir: "rtl" },
  { code: "es", name: "Español (Spanish)", dir: "ltr" },
  { code: "pt", name: "Português (Portuguese)", dir: "ltr" },
  { code: "it", name: "Italiano (Italian)", dir: "ltr" },
];

export default function VisitorTourPreviewPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const { data: tour, isLoading, error } = useTour(slug);

  const [previewLang, setPreviewLang] = useState("en");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading visitor preview...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Tour Not Found</h2>
        <Link href={`/${locale}/admin/tours`}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const activeLangConfig = LOCALES.find((l) => l.code === previewLang) || LOCALES[0];
  const isRtl = activeLangConfig.dir === "rtl";

  const title = tour.titleJsonb?.[previewLang] || tour.titleJsonb?.en || tour.slug;
  const subtitle = tour.subtitleJsonb?.[previewLang] || tour.subtitleJsonb?.en || "";
  const overview = tour.overviewJsonb?.[previewLang] || tour.overviewJsonb?.en || tour.descriptionJsonb?.[previewLang] || "";
  const duration = tour.durationJsonb?.[previewLang] || tour.durationJsonb?.en || "";
  const heroImg = tour.heroImage || tour.images?.[0]?.imageUrl || "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Preview Controls Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/tours/${tour.slug}`}>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit Preview
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
            Visitor Preview (معاينة كزائر)
          </Badge>
          <span className="text-xs font-mono text-slate-400 hidden md:inline">/{tour.slug}</span>
        </div>

        {/* Controls: Language & Viewport */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setPreviewLang(loc.code)}
                className={`text-xs px-2 py-0.5 rounded font-semibold uppercase transition-colors ${
                  previewLang === loc.code ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                {loc.code}
              </button>
            ))}
          </div>

          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700 hidden sm:flex">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1 rounded text-slate-400 hover:text-white ${viewport === "desktop" ? "bg-slate-700 text-amber-400" : ""}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1 rounded text-slate-400 hover:text-white ${viewport === "tablet" ? "bg-slate-700 text-amber-400" : ""}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1 rounded text-slate-400 hover:text-white ${viewport === "mobile" ? "bg-slate-700 text-amber-400" : ""}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <Link href={`/${locale}/admin/tours/${tour.slug}/edit`}>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit Tour
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Preview Screen Shell */}
      <div className="flex-1 flex justify-center py-6 px-2 overflow-x-auto bg-slate-950">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`transition-all duration-300 bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${
            viewport === "mobile"
              ? "w-[375px]"
              : viewport === "tablet"
              ? "w-[768px]"
              : "w-full max-w-5xl"
          }`}
        >
          {/* 1. Hero Banner */}
          <div className="relative h-[360px] md:h-[480px] w-full overflow-hidden">
            {heroImg ? <img src={heroImg} alt={title} className="w-full h-full object-cover" /> : <div className="h-full w-full bg-slate-900" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-8 inset-x-8 text-center space-y-3">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
                {tour.category || "Luxury Journey"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white font-bold">{title}</h1>
              {subtitle && <p className="text-amber-200/90 text-sm md:text-base">{subtitle}</p>}
            </div>
          </div>

          {/* 2. Quick Info Strip */}
          <div className="bg-slate-850 border-y border-slate-800 grid grid-cols-3 divide-x divide-slate-800 text-center p-4">
            <div className="space-y-1">
              <div className="text-amber-400 flex items-center justify-center gap-1.5 text-xs font-medium uppercase">
                <Clock className="w-4 h-4" /> Duration
              </div>
              <div className="text-sm font-semibold text-white">{duration}</div>
            </div>
            <div className="space-y-1">
              <div className="text-amber-400 flex items-center justify-center gap-1.5 text-xs font-medium uppercase">
                <Tag className="w-4 h-4" /> Price From
              </div>
              <div className="text-sm font-semibold text-white font-mono">${tour.basePriceUsd} USD</div>
            </div>
            <div className="space-y-1">
              <div className="text-amber-400 flex items-center justify-center gap-1.5 text-xs font-medium uppercase">
                <Users className="w-4 h-4" /> Group Size
              </div>
              <div className="text-sm font-semibold text-white">2 - {tour.capacity} Guests</div>
            </div>
          </div>

          {/* 3. Main Content Grid */}
          <div className="p-6 md:p-10 space-y-12">
            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-amber-400 border-b border-amber-500/20 pb-2">
                Overview
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">{overview}</p>
            </div>

            {/* Day-by-Day Itinerary */}
            {tour.itineraries && tour.itineraries.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-amber-400 border-b border-amber-500/20 pb-2">
                  Itinerary ({tour.itineraries.length} Days)
                </h2>
                <div className="space-y-4">
                  {tour.itineraries.map((day, idx) => (
                    <div key={day.id || idx} className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-400 text-sm">{day.dayLabel || `Day ${idx + 1}`}</span>
                        {day.mealsJsonb?.[previewLang] && (
                          <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-600">
                            {day.mealsJsonb[previewLang]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                        {day.descriptionJsonb?.[previewLang] || day.descriptionJsonb?.en || "Day details..."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> Included Services
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• Luxury accommodation with breakfast</li>
                  <li>• Professional English/Spanish speaking guide</li>
                  <li>• Airport transfers in private air-conditioned vehicle</li>
                  <li>• Entrance fees to all historical sites</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-3">
                <h3 className="font-semibold text-rose-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" /> Excluded Services
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• International flight tickets</li>
                  <li>• Entry visa fees</li>
                  <li>• Tipping for driver and guide</li>
                  <li>• Personal expenses and optional tours</li>
                </ul>
              </div>
            </div>

            {/* Booking CTA */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/20 border border-amber-500/30 text-center space-y-4">
              <h3 className="text-xl font-serif font-bold text-white">Ready for an Unforgettable Journey?</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Reserve your spot now or contact our luxury travel specialists to tailor this tour.
              </p>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8">
                Book This Tour Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
