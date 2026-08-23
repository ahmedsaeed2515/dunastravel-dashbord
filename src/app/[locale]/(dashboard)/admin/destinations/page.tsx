"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { useParams } from "next/navigation";

export default function DestinationsPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "منظومة إدارة الوجهات السياحية والباكدجات الـ 8" : "8 Destinations & Egypt Packages Suite"}
        description={
          isAr
            ? "إدارة الوجهات السياحية الـ 8 الرئيسية، البانرات الديناميكية، باكدجات مصر المخصصة، ونقل الرحلات بنقرة واحدة."
            : "Manage the 8 premier travel destinations, dynamic country banners, bespoke Egypt packages, and one-click trip transfers."
        }
      />
      <DestinationsManager />
    </div>
  );
}
