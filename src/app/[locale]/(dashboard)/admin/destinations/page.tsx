"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { DestinationsDirectoryTable } from "@/features/destinations/components/DestinationsDirectoryTable";
import { useAdminDestinations } from "@/features/destinations/hooks/useDestinationsAdmin";
import { useTours } from "@/features/tours/hooks/useTours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Compass,
  Globe,
  MapPin,
  Package,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
export default function DestinationsPage() {
  const [activeTab, setActiveTab] = useState<string>("directory");
  const [focusedDestinationId, setFocusedDestinationId] = useState<string | undefined>();

  const { data: destinationsData } = useAdminDestinations({ limit: 100 });
  const { data: toursData } = useTours({ limit: 500 });

  const destinations = useMemo(() => {
    return Array.isArray(destinationsData)
      ? destinationsData
      : destinationsData?.data ?? [];
  }, [destinationsData]);

  // Calculate live statistics
  const stats = useMemo(() => {
    const total = destinations.length;
    const published = destinations.filter((d) => d.status === "PUBLISHED" && d.isActive).length;
    const totalAttachedTours = destinations.reduce((acc, d) => {
      return (
        acc +
        (d.totalToursCount ?? (Array.isArray(d.tours) ? d.tours.length : 0))
      );
    }, 0);

    // Multilingual coverage across 5 locales (ar, en, es, pt, it)
    let completeLocalesCount = 0;
    const locales = ["ar", "en", "es", "pt", "it"];
    destinations.forEach((d) => {
      const titles = d.titleJsonb || {};
      locales.forEach((loc) => {
        if (typeof titles[loc] === "string" && titles[loc].trim()) {
          completeLocalesCount++;
        }
      });
    });
    const maxPossible = Math.max(1, total * 5);
    const parityPercent = total > 0 ? Math.round((completeLocalesCount / maxPossible) * 100) : 100;

    return {
      total,
      published,
      totalAttachedTours,
      parityPercent,
    };
  }, [destinations]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="إدارة الوجهات السياحية — إضافة وتعديل وحذف الواجهات والمدن المعروضة للعملاء مع دعم 5 لغات وإدارة الرحلات التابعة."
        title="نظام إدارة الوجهات السياحية والرحلات (Destinations Command Center)"
        description="تحكم كامل وشامل في الوجهات السياحية، إنشاء واجهات جديدة، الترجمات باللغات الـ 5، الصور والفيديوهات، وتحسين محركات البحث، وتوزيع الرحلات."
      />

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Destinations */}
        <Card className="p-4 rounded-2xl border bg-card/60 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">
              {stats.total}
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              إجمالي الوجهات
            </div>
          </div>
        </Card>

        {/* Published Active */}
        <Card className="p-4 rounded-2xl border bg-card/60 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">
              {stats.published}
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              وجهات منشورة ونشطة
            </div>
          </div>
        </Card>

        {/* Attached Tours */}
        <Card className="p-4 rounded-2xl border bg-card/60 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">
              {stats.totalAttachedTours}
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              رحلات مرتبطة بالوجهات
            </div>
          </div>
        </Card>

        {/* 5-Locale Parity */}
        <Card className="p-4 rounded-2xl border bg-card/60 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">
              {stats.parityPercent}%
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              اكتمال الترجمات الـ 5
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 rounded-2xl border inline-flex">
          <TabsTrigger
            value="directory"
            className="rounded-xl font-bold text-xs px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <Layers className="h-4 w-4 text-amber-500" />
            دليل وإدارة الوجهات (Destinations Management)
          </TabsTrigger>
          <TabsTrigger
            value="tours-explorer"
            className="rounded-xl font-bold text-xs px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <Compass className="h-4 w-4 text-blue-500" />
            توزيع وجرد الرحلات (Tours by Destination Explorer)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Destinations Table & Full CRUD */}
        <TabsContent value="directory" className="space-y-4">
          <DestinationsDirectoryTable
            onSelectDestinationForTours={(slug) => {
              setFocusedDestinationId(slug);
              setActiveTab("tours-explorer");
            }}
          />
        </TabsContent>

        {/* TAB 2: Visual Explorer / Trip Manager by Destination */}
        <TabsContent value="tours-explorer" className="space-y-4">
          <DestinationsManager initialDestinationId={focusedDestinationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
