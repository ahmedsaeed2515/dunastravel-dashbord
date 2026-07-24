"use client";

import { Suspense } from "react";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Package } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Tours & Tour Interfaces System"
        description="Manage landing pages, tour collections, multi-country packages, localized content, and global tour library."
      />

      <Tabs defaultValue="interfaces" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="interfaces" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Tour Interfaces & Landing Pages
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> All Tours Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interfaces" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <LandingPagesTable />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="tours" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <Suspense fallback={<TableSkeleton />}>
              <ToursTable />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
