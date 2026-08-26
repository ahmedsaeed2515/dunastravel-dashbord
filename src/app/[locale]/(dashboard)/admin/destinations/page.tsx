"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { LandingPagesTable } from "@/features/tours/components/LandingPagesTable/LandingPagesTable";

export default function DestinationsPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="8 Destinations & Egypt Packages Suite"
        description="إدارة الواجهات السياحية الـ 8 الرئيسية، البانرات الديناميكية، باكدجات مصر المخصصة، ونقل الرحلات بنقرة واحدة."
      />
      <LandingPagesTable fixedType="DESTINATION" />
    </div>
  );
}
