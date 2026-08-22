"use client";

import { usePackages } from "@/features/packages/hooks/usePackages";
import { PackagesGrid } from "@/features/packages/components/PackagesGrid";
import { CreatePackageDialog } from "@/features/packages/components/CreatePackageDialog";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PackagesPage() {
  const { data: packages = [], isLoading } = usePackages();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="إدارة الباكدجز والبرامج السياحية (Packages Manager)"
        description="إدارة رحلات الدول المتعددة، برامج شهر العسل والبرامج السياحية الخاصة مع المشتملات والأسعار."
        actions={<CreatePackageDialog />}
      />

      <PackagesGrid packages={packages} isLoading={isLoading} />
    </div>
  );
}
