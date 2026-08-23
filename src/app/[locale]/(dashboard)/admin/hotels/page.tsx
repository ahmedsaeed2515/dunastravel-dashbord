"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { HotelsManager } from "@/components/hotels/HotelsManager";
import { useParams } from "next/navigation";

export default function HotelsPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة الفنادق والإقامة الفاخرة" : "Hotels & Accommodations Suite"}
        description={
          isAr
            ? "إدارة الفنادق المعتمدة، الفئات، التقييمات، فئات الغرف والسياسات مع الترجمات الـ 5."
            : "Manage partner luxury hotels, star ratings, room classifications, and policies across 5 languages."
        }
      />
      <HotelsManager />
    </div>
  );
}
