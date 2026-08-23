"use client";

import { useTransportation } from "@/features/transportation/hooks/useTransportation";
import { TransportationFleetGrid } from "@/features/transportation/components/TransportationFleetGrid";
import { CreateTransportDialog } from "@/features/transportation/components/CreateTransportDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useParams } from "next/navigation";

export default function TransportationPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const { data: fleet = [], isLoading } = useTransportation();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "إدارة أسطول التنقل والسيارات الفاخرة" : "Transportation Fleet & Luxury Vehicles Suite"}
        description={
          isAr
            ? "إدارة ومتابعة حافلات Dunas Travel السياحية وسيارات الـ VIP وسيارات السفاري المتاحة للتنقلات والجولات."
            : "Manage and monitor luxury tourist buses, VIP executive vehicles, and 4x4 safari fleet."
        }
        actions={<CreateTransportDialog />}
      />

      <TransportationFleetGrid fleet={fleet} isLoading={isLoading} />
    </div>
  );
}
