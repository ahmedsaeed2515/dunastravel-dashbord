"use client";

import { useTransportation } from "@/features/transportation/hooks/useTransportation";
import { TransportationFleetGrid } from "@/features/transportation/components/TransportationFleetGrid";
import { CreateTransportDialog } from "@/features/transportation/components/CreateTransportDialog";
import { PageHeader } from "@/components/shared/PageHeader";

export default function TransportationPage() {
  const { data: fleet = [], isLoading } = useTransportation();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="إدارة أسطول التنقل والسيارات (Transportation Fleet)"
        description="إدارة ومتابعة حافلات Dunas Travel السياحية وسيارات الـ VIP وسيارات السفاري المتاحة للتنقلات والجولات."
        actions={<CreateTransportDialog />}
      />

      <TransportationFleetGrid fleet={fleet} isLoading={isLoading} />
    </div>
  );
}
