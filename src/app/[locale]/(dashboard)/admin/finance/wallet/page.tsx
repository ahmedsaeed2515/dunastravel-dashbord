"use client";

import { useState } from "react";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function WalletPage() {
  const [ownerType, setOwnerType] = useState<"COMPANY" | "USER">("COMPANY");
  const [ownerId, setOwnerId] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && ownerId.trim()) {
      setSearchTrigger(ownerId.trim());
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Wallet & Balance Management"
        description="Inspect platform financial metrics, search B2B agency or customer wallet balances, and audit transaction ledgers."
      />

      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        <Card className="border-border/80 shadow-xs bg-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-[200px] space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner Type</label>
                <Select value={ownerType} onValueChange={(val: any) => setOwnerType(val || "COMPANY")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">B2B Company</SelectItem>
                    <SelectItem value="USER">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner ID (Press Enter to search)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Enter Company or User UUID..." 
                    className="pl-9"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchTrigger ? (
          <WalletLedger ownerType={ownerType} ownerId={searchTrigger} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-xl text-muted-foreground bg-card">
            <Search className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">Enter an Owner ID above and press Enter to view their wallet ledger.</p>
          </div>
        )}
      </RequirePermission>
    </div>
  );
}
