"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { HotelsGrid } from "@/features/hotels/components/HotelsGrid";
import { CreateHotelDialog } from "@/features/hotels/components/CreateHotelDialog";
import { useHotels } from "@/features/hotels/hooks/useHotels";

export default function HotelsPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const query = useHotels();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة الفنادق والإقامة" : "Hotels & Accommodations"}
        description={isAr ? "كل الفنادق المعروضة هنا محفوظة في الباك إند." : "Every hotel shown here is loaded from the backend."}
        actions={<CreateHotelDialog />}
      />
      {query.isError ? (
        <QueryErrorState message={isAr ? "تعذر تحميل الفنادق من الباك إند." : "Hotels could not be loaded from the backend."} onRetry={() => void query.refetch()} />
      ) : (
        <HotelsGrid hotels={query.data ?? []} isLoading={query.isLoading} />
      )}
    </div>
  );
}
