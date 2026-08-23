"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { TransportationFleetGrid } from "@/features/transportation/components/TransportationFleetGrid";
import { CreateTransportDialog } from "@/features/transportation/components/CreateTransportDialog";
import { useTransportation } from "@/features/transportation/hooks/useTransportation";

export default function TransportationPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const query = useTransportation();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة أسطول النقل" : "Transportation Fleet"}
        description={isAr ? "المركبات المحفوظة فعلياً في الباك إند." : "Fleet records stored in the backend."}
        actions={<CreateTransportDialog />}
      />
      {query.isError ? (
        <QueryErrorState message={isAr ? "تعذر تحميل أسطول النقل من الباك إند." : "Fleet data could not be loaded from the backend."} onRetry={() => void query.refetch()} />
      ) : (
        <TransportationFleetGrid fleet={query.data ?? []} isLoading={query.isLoading} />
      )}
    </div>
  );
}
