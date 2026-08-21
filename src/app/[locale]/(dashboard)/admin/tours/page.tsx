"use client";

import { Suspense } from "react";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Globe, Package } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Trips & 8 Destinations Suite"
        description="إدارة جميع رحلات الواجهات الـ 8، باكدجات مصر المخصصة، محرر الترجمات الـ 5، ونظام نقل الرحلات المتقدم."
      />

      <Tabs defaultValue="destinations" className="w-full">
        <TabsList className="flex flex-wrap items-center gap-1.5 bg-card/80 border border-border/80 p-1.5 rounded-2xl max-w-2xl mb-6 shadow-xs backdrop-blur-md">
          <TabsTrigger value="destinations" className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">
            <Compass className="w-4 h-4" /> الواجهات الـ 8 ونقل الرحلات
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">
            <Package className="w-4 h-4" /> المكتبة العامة للرحلات
          </TabsTrigger>
          <TabsTrigger value="interfaces" className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4" /> الواجهات وصفحات الهبوط
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="space-y-4">
          <DestinationsManager />
        </TabsContent>

        <TabsContent value="tours" className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <ToursTable />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="interfaces" className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <LandingPagesTable />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
