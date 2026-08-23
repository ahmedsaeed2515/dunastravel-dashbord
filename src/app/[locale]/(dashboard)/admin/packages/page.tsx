"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { PackagesGrid } from "@/features/packages/components/PackagesGrid";
import { CreatePackageDialog } from "@/features/packages/components/CreatePackageDialog";
import { usePackages } from "@/features/packages/hooks/usePackages";

export default function PackagesPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const query = usePackages();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة البرامج والباقات السياحية" : "Holiday Packages & Bundles"}
        description={isAr ? "الباقات المحفوظة فعلياً في الباك إند." : "Packages stored in the backend."}
        actions={<CreatePackageDialog />}
      />
      {query.isError ? (
        <QueryErrorState message={isAr ? "تعذر تحميل الباقات من الباك إند." : "Packages could not be loaded from the backend."} onRetry={() => void query.refetch()} />
      ) : (
        <PackagesGrid packages={query.data ?? []} isLoading={query.isLoading} />
      )}
    </div>
  );
}
