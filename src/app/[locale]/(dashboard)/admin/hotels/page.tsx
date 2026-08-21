"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { HotelsManager } from "@/components/hotels/HotelsManager";

export default function HotelsPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Hotels & Accommodations Suite"
        description="إدارة الفنادق والإقامة، الفئات، التقييمات، فئات الغرف والسياسات مع الترجمات الـ 5."
      />
      <HotelsManager />
    </div>
  );
}
