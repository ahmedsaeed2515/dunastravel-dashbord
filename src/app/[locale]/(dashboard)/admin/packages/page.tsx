"use client";

import { usePackages } from "@/features/packages/hooks/usePackages";
import { PackagesGrid } from "@/features/packages/components/PackagesGrid";
import { CreatePackageDialog } from "@/features/packages/components/CreatePackageDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useParams } from "next/navigation";

export default function PackagesPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const { data: packages = [], isLoading } = usePackages();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة البرامج والباكدجات السياحية" : "Holiday Packages & Bundles Manager"}
        description={
          isAr
            ? "إدارة رحلات الدول المتعددة، برامج شهر العسل والبرامج السياحية الخاصة مع المشتملات والأسعار."
            : "Manage multi-destination itineraries, seasonal honeymoon programs, and bespoke holiday packages."
        }
        actions={<CreatePackageDialog />}
      />

      <PackagesGrid packages={packages} isLoading={isLoading} />
    </div>
  );
}
