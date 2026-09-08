"use client";

import { useState, useEffect, useCallback } from "react";
import { WalletLedger } from "@/features/finance/components/WalletLedger";
import { FinanceMetricsBanner } from "@/features/finance/components/FinanceMetricsBanner";
import { WalletsDirectoryTable } from "@/features/finance/components/WalletsDirectoryTable";
import { ManualWalletTransactionDialog } from "@/features/finance/components/ManualWalletTransactionDialog";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, RefreshCw, Wallet, Building2, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTranslations } from "next-intl";
import { financeApi } from "@/features/finance/api/financeApi";
import { WalletDirectoryItem } from "@/features/finance/types";
import { toast } from "sonner";

export default function WalletPage() {
  const tFinance = useTranslations("finance");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");

  const [search, setSearch] = useState("");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>("ALL");
  const [wallets, setWallets] = useState<WalletDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileFeedback, setReconcileFeedback] = useState<string | null>(null);

  // Modals / Drawers state
  const [selectedWalletForLedger, setSelectedWalletForLedger] = useState<WalletDirectoryItem | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedWalletForTx, setSelectedWalletForTx] = useState<WalletDirectoryItem | null>(null);
  const [txDialogType, setTxDialogType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);

  const fetchWallets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (ownerTypeFilter !== "ALL") {
        params.ownerType = ownerTypeFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      const res = await financeApi.getWallets(params);
      setWallets(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load wallets directory.");
    } finally {
      setIsLoading(false);
    }
  }, [ownerTypeFilter, search]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleReconcile = async () => {
    setIsReconciling(true);
    setReconcileFeedback(null);
    try {
      const res = await financeApi.reconcileWallets();
      toast.success(res.message || "Ledger reconciliation completed!");
      setReconcileFeedback(res.message);
      fetchWallets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Reconciliation failed.");
    } finally {
      setIsReconciling(false);
    }
  };

  const handleOpenDeposit = (w: WalletDirectoryItem) => {
    setSelectedWalletForTx(w);
    setTxDialogType("CREDIT");
    setIsTxDialogOpen(true);
  };

  const handleOpenDebit = (w: WalletDirectoryItem) => {
    setSelectedWalletForTx(w);
    setTxDialogType("DEBIT");
    setIsTxDialogOpen(true);
  };

  const handleOpenLedger = (w: WalletDirectoryItem) => {
    setSelectedWalletForLedger(w);
    setIsLedgerOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        helpTooltip="المحافظ الرقمية — رصيد المحفظة لكل وكالة شريكة وسجل المعاملات."
        title={tFinance("walletTitle") || "B2B Corporate Wallets & Ledgers"}
        description={tFinance("walletDesc") || "Manage enterprise partner deposits, credit limits, and automated commission payouts."}
        actions={
          <RequirePermission action="manage" resource="finance">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReconcile} 
              disabled={isReconciling}
              className="gap-2 font-bold shadow-xs hover:bg-muted/80"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReconciling ? 'animate-spin text-primary' : ''}`} />
              <span>{isReconciling ? "Reconciling Ledgers..." : "Reconcile All Ledgers"}</span>
            </Button>
          </RequirePermission>
        }
      />

      {/* Global Financial Metrics Banner */}
      <FinanceMetricsBanner />

      <RequirePermission action="view" resource="finance">
        {/* Search & Filter Bar */}
        <Card className="border-border/80 shadow-xs bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto flex-1">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search by Partner Name, Ref Code (#AGY-...), or Email..." 
                    className="ps-8 text-xs dir-ltr text-start h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Owner Type Filter */}
                <div className="w-full sm:w-[220px]">
                  <Select value={ownerTypeFilter} onValueChange={(val) => setOwnerTypeFilter(val || "ALL")}>
                    <SelectTrigger className="text-xs h-9 font-semibold">
                      <SelectValue placeholder="All Partner Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">🌐 All Partner Wallets</SelectItem>
                      <SelectItem value="COMPANY">🏢 Corporate & Agencies</SelectItem>
                      <SelectItem value="USER">👤 Independent Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs font-mono text-muted-foreground shrink-0">
                Found <strong>{wallets.length}</strong> wallets
              </div>
            </div>

            {reconcileFeedback && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{reconcileFeedback}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallets Directory Table */}
        <WalletsDirectoryTable
          data={wallets}
          isLoading={isLoading}
          onViewLedger={handleOpenLedger}
          onDeposit={handleOpenDeposit}
          onDebit={handleOpenDebit}
        />

        {/* Manual Deposit / Debit Modal */}
        <ManualWalletTransactionDialog
          isOpen={isTxDialogOpen}
          onClose={() => setIsTxDialogOpen(false)}
          onSuccess={fetchWallets}
          wallet={selectedWalletForTx}
          defaultType={txDialogType}
        />

        {/* Ledger Drawer / Dialog */}
        <Dialog open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
          <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedWalletForLedger?.owner?.name || "Partner"} — Full Transaction Ledger
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Chronological audit trail of all credits, debits, commission payouts, and booking deductions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedWalletForLedger && (
              <div className="pt-2">
                <WalletLedger
                  walletId={selectedWalletForLedger.id}
                  initialWallet={selectedWalletForLedger}
                  ownerType={selectedWalletForLedger.ownerType}
                  ownerId={selectedWalletForLedger.ownerId}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </RequirePermission>
    </div>
  );
}
