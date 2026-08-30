"use client";

import { useState } from "react";
import { Tour } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Star, MapPin, Layers, Globe, DollarSign, Calendar } from "lucide-react";
import { ItineraryManager } from "../ItineraryManager";
import { MediaManager } from "../MediaManager";
import { Button } from "@/components/ui/button";

interface TourDetailsDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
];

const formatDateSafe = (dateStr?: string | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, fmt);
  } catch {
    return "N/A";
  }
};

export function TourDetailsDrawer({ tour, open, onOpenChange }: TourDetailsDrawerProps) {
  const [selectedLang, setSelectedLang] = useState<string>("en");

  if (!tour) return null;

  const currentLangObj = SUPPORTED_LANGS.find(l => l.code === selectedLang) || SUPPORTED_LANGS[0];
  
  const getLocalizedText = (jsonb: any) => {
    if (!jsonb) return "";
    if (typeof jsonb === "string") return jsonb;
    return jsonb[selectedLang] || jsonb["en"] || jsonb["es"] || Object.values(jsonb)[0] || "";
  };

  const title = getLocalizedText(tour.titleJsonb) || tour.slug;
  const overview = getLocalizedText(tour.overviewJsonb || tour.descriptionJsonb) || "No description provided.";
  const duration = getLocalizedText(tour.durationJsonb) || "8 Days / 7 Nights";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[750px] md:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={tour.status === "PUBLISHED" ? "default" : tour.status === "DRAFT" ? "secondary" : "destructive"}>
                  {tour.status}
                </Badge>
                {tour.isFeatured && (
                  <Badge variant="outline" className="border-amber-400 bg-amber-500/10 text-amber-500 gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Featured
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {tour.category || "General"}
                </Badge>
              </div>
              <SheetTitle className="text-2xl font-bold font-serif tracking-tight" dir={currentLangObj.dir}>
                {title}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs text-muted-foreground">
                SLUG: {tour.slug}
              </SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary font-mono">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: tour.currency || "USD" }).format(parseFloat(tour.basePriceUsd || "0"))}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Created {formatDateSafe(tour.createdAt)}
              </div>
            </div>
          </div>

          {/* 5-Language Switcher Toolbar */}
          <div className="flex items-center justify-between border-t border-b py-2 px-1 bg-muted/30 rounded-lg">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> Preview Language:
            </span>
            <div className="flex items-center gap-1">
              {SUPPORTED_LANGS.map((l) => (
                <Button
                  key={l.code}
                  type="button"
                  variant={selectedLang === l.code ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs font-bold"
                  onClick={() => setSelectedLang(l.code)}
                >
                  {l.code.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-11 mb-4 bg-muted/60 p-1 rounded-xl font-bold">
            <TabsTrigger value="overview" className="text-xs font-bold">نظرة عامة</TabsTrigger>
            <TabsTrigger value="itinerary" className="text-xs font-bold">البرنامج اليومي</TabsTrigger>
            <TabsTrigger value="media" className="text-xs font-bold">الصور والوسائط</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs font-bold">الأسعار</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs font-bold">سجل التعديلات</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="bg-card p-5 rounded-2xl border shadow-sm space-y-3" dir={currentLangObj.dir}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">نظرة عامة وملخص ({selectedLang.toUpperCase()})</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">{duration}</Badge>
                </div>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{overview}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-2xl border shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> الموقع الجغرافي والوجهة
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block font-bold">الدولة</span>
                      <span className="font-bold">{tour.country || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block font-bold">المدينة</span>
                      <span className="font-bold">{tour.city || "غير محدد"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-2xl border shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> السعة والمقاعد المتاحة
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block font-bold">السعة الكلية</span>
                      <span className="font-bold">{tour.capacity ?? "—"} مقعد</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block font-bold">المقاعد المتبقية</span>
                      <span className="font-bold text-emerald-600 font-mono">{tour.remainingSeats ?? "—"} مقعد</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ITINERARY TAB */}
            <TabsContent value="itinerary" className="space-y-4">
              <ItineraryManager tour={tour} />
            </TabsContent>

            {/* MEDIA TAB */}
            <TabsContent value="media" className="space-y-4">
              <MediaManager tour={tour} />
            </TabsContent>

            {/* PRICING TAB */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary" /> Seasonal Pricing Rules
                </h3>
                {tour.seasonPricingJsonb && typeof tour.seasonPricingJsonb === 'object' && Object.keys(tour.seasonPricingJsonb).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(tour.seasonPricingJsonb).map(([k, v]) => (
                      <div key={k} className="p-3 bg-muted/40 rounded-lg border border-border/50">
                        <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-1">
                          {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                      <span className="text-muted-foreground block text-[11px] font-bold mb-1">هامش الربح الافتراضي</span>
                      <span className="font-mono font-bold text-foreground">25%</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                      <span className="text-muted-foreground block text-[11px] font-bold mb-1">التسعير الديناميكي</span>
                      <span className="font-bold text-foreground">المستوى القياسي</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AUDIT LOGS TAB */}
            <TabsContent value="audit" className="space-y-4">
              {tour.activityLogs && tour.activityLogs.length > 0 ? (
                <div className="relative border-l border-muted ml-3 space-y-6">
                  {tour.activityLogs.map((log: any, i: number) => (
                    <div key={log.id || i} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5" />
                      <div className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatDateSafe(log.createdAt, "MMM do, yyyy h:mm a")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-xl bg-card">
                  No audit logs recorded for this tour.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
