"use client";

import { useHotels } from "@/features/hotels/hooks/useHotels";
import { HotelsGrid } from "@/features/hotels/components/HotelsGrid";
import { CreateHotelDialog } from "@/features/hotels/components/CreateHotelDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Hotel } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HotelsPage() {
  const { data: hotels = [], isLoading } = useHotels();
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="إدارة الفنادق المعتمدة (Hotels Management)"
        description="إدارة وتحديث بيانات وتصنيفات الفنادق الفاخرة المعتمدة عبر جميع وجهات Dunas Travel."
        actions={<CreateHotelDialog />}
      />

      <HotelsGrid hotels={hotels} isLoading={isLoading} />
    </div>
  );
}
