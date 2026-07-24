import { Suspense } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { OperationsSection } from "@/features/dashboard/components/OperationsSection";
import { PageLoader } from "@/components/shared/ui/PageLoader";

export const metadata = {
  title: "Dashboard Overview - Dunas Travel Admin",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <DashboardHeader />
      
      <Suspense fallback={<PageLoader />}>
        <KPIGrid />
        <AnalyticsCharts />
        <OperationsSection />
      </Suspense>
    </div>
  );
}
