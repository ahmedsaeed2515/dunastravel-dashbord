import { PageHeader } from "@/components/shared/PageHeader";
import { TransportationServicesManager } from "@/features/transportation/components/TransportationServicesManager";

export default function TransportationPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Transportation Services" description="Manage the persisted transfer services offered to customers." />
      <TransportationServicesManager />
    </div>
  );
}
