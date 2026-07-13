"use client";

import { useState } from "react";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

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
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Financial Operations
            </span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Wallet Management</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-base">
            View platform financial metrics, search B2B/B2C wallets, and manage manual ledger adjustments.
          </p>
        </div>
      </div>

      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        <Card className="mb-6 border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Owner Type</label>
                <Select value={ownerType} onValueChange={(val: any) => setOwnerType(val || "COMPANY")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">B2B Company</SelectItem>
                    <SelectItem value="USER">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-[3] space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Owner ID (Press Enter to search)</label>
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
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
            <Search className="h-8 w-8 mb-4 opacity-50" />
            <p>Enter an Owner ID and press Enter to view their wallet ledger.</p>
          </div>
        )}
      </RequirePermission>
    </div>
  );
}
