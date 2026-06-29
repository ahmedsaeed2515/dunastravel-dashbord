import { Suspense } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { KPIGrid } from "@/features/dashboard/components/KPIGrid";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { OperationsSection } from "@/features/dashboard/components/OperationsSection";
import { PageLoader } from "@/components/shared/ui/PageLoader";

export const metadata = {
  title: "Dashboard Overview - Dunas Travel",
};

export default function DashboardPage() {
  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <DashboardHeader />
      
      <Suspense fallback={<PageLoader />}>
        <KPIGrid />
        <AnalyticsCharts />
        <OperationsSection />
      </Suspense>
    </div>
  );
}
