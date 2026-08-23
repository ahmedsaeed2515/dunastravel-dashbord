"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";
import { Globe2, Package } from "lucide-react";

export default function ToursPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة الرحلات" : "Tours Management"}
        description={isAr ? "عرض وإنشاء وتعديل الرحلات المحفوظة فعلياً في قاعدة البيانات." : "View, create, and edit tours stored in the backend database."}
      />
      <Tabs defaultValue="tours" className="w-full">
        <TabsList>
          <TabsTrigger value="tours" className="gap-2"><Package className="h-4 w-4" />{isAr ? "الرحلات" : "Tours"}</TabsTrigger>
          <TabsTrigger value="landing-pages" className="gap-2"><Globe2 className="h-4 w-4" />{isAr ? "صفحات الرحلات" : "Tour pages"}</TabsTrigger>
        </TabsList>
        <TabsContent value="tours" className="mt-6"><ToursTable /></TabsContent>
        <TabsContent value="landing-pages" className="mt-6"><LandingPagesTable /></TabsContent>
      </Tabs>
    </div>
  );
}
