import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { SecondaryMetricsGrid } from "@/features/dashboard/components/SecondaryMetricsGrid";
import { OperationsSection } from "@/features/dashboard/components/OperationsSection";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader />
      <KPIGrid />
      <SecondaryMetricsGrid />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <AnalyticsCharts />
        <OperationsSection />
      </div>
    </div>
  );
}
