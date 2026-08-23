"use client";

import { useState } from "react";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { useReconcileLedger } from "@/features/finance/hooks/useFinance";

export default function WalletPage() {
  const tFinance = useTranslations("finance");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");

  const [ownerType, setOwnerType] = useState<"COMPANY" | "USER">("COMPANY");
  const [ownerId, setOwnerId] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const reconcileLedger = useReconcileLedger();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && ownerId.trim()) {
      setSearchTrigger(ownerId.trim());
    }
  };

  const handleReconcile = () => reconcileLedger.mutate();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tFinance("walletTitle")}
        description={tFinance("walletDesc")}
      />

      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        <Card className="border-border/80 shadow-xs bg-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-end flex-1">
                <div className="w-full sm:w-[200px] space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tCommon("type")}</label>
                  <Select value={ownerType} onValueChange={(val: any) => setOwnerType(val || "COMPANY")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tCommon("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPANY">{tNav("companies")}</SelectItem>
                      <SelectItem value="USER">{tNav("customers")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</label>
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={`${tCommon("searchPlaceholder")}...`} 
                      className="ps-9 dir-ltr text-start"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      onKeyDown={handleSearch}
                    />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleReconcile} 
                disabled={reconcileLedger.isPending}
                className="gap-2 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${reconcileLedger.isPending ? 'animate-spin' : ''}`} />
                {reconcileLedger.isPending ? "Reconciling..." : "Reconcile Ledger"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchTrigger ? (
          <WalletLedger ownerType={ownerType} ownerId={searchTrigger} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-xl text-muted-foreground bg-card">
            <Search className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">{tFinance("noWallets")}</p>
          </div>
        )}
      </RequirePermission>
    </div>
  );
}
