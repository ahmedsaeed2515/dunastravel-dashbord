import { CommissionsView } from "@/features/finance/components/CommissionsView";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";

export default function FinancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Finance & Payments</h2>
      </div>
      <FinanceMetricsBanner />
      <WalletLedger ownerType="COMPANY" ownerId="MASTER" />
      <CommissionsView />
    </div>
  );
}
