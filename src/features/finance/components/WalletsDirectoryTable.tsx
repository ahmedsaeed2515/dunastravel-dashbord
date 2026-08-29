"use client";

import { WalletDirectoryItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  User, 
  Wallet, 
  PlusCircle, 
  MinusCircle, 
  History, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface WalletsDirectoryTableProps {
  data: WalletDirectoryItem[];
  isLoading: boolean;
  onViewLedger: (wallet: WalletDirectoryItem) => void;
  onDeposit: (wallet: WalletDirectoryItem) => void;
  onDebit: (wallet: WalletDirectoryItem) => void;
}

export function WalletsDirectoryTable({
  data,
  isLoading,
  onViewLedger,
  onDeposit,
  onDebit,
}: WalletsDirectoryTableProps) {
  const tCommon = useTranslations("common");
  const tFinance = useTranslations("finance");

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading partner wallets directory...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 border-2 border-dashed border-border/80 rounded-2xl text-center space-y-3 bg-muted/10">
        <Wallet className="h-10 w-10 mx-auto text-amber-500/60" />
        <p className="font-bold text-sm text-foreground">No partner wallets found</p>
        <p className="text-xs max-w-md mx-auto text-muted-foreground">
          Wallets are automatically initialized when new B2B Companies or Travel Agents are registered.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden shadow-xs">
      <table className="w-full text-xs text-left">
        <thead className="bg-muted/60 font-bold text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border/60">
          <tr>
            <th className="p-3.5">Partner / Account</th>
            <th className="p-3.5">Type & Role</th>
            <th className="p-3.5">Available Balance</th>
            <th className="p-3.5">Commission Rate</th>
            <th className="p-3.5">Ledger Activity</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-card">
          {data.map((wallet) => {
            const isCompany = wallet.ownerType === "COMPANY";
            const owner = wallet.owner;
            const balance = Number(wallet.balance) || 0;

            return (
              <tr key={wallet.id} className="hover:bg-muted/20 transition-colors">
                {/* Partner Name & Details */}
                <td className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompany ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {isCompany ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-xs">{owner?.name || "Unnamed Partner"}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {owner?.referenceCode ? `#${owner.referenceCode}` : owner?.email || wallet.ownerId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Type & Role Badge */}
                <td className="p-3.5">
                  {isCompany ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                      🏢 {owner?.type || "AGENCY"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] border border-purple-500/20">
                      👤 {owner?.role || "AGENT"}
                    </span>
                  )}
                </td>

                {/* Balance */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`font-black text-sm ${
                      balance > 0 ? "text-emerald-600 dark:text-emerald-400" : balance === 0 ? "text-muted-foreground" : "text-destructive"
                    }`}>
                      ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{wallet.currency || "USD"}</span>
                  </div>
                </td>

                {/* Commission Rate */}
                <td className="p-3.5 font-semibold text-muted-foreground">
                  {owner?.commissionRate !== undefined && owner?.commissionRate > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      {owner.commissionRate}% Default
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </td>

                {/* Transactions Count */}
                <td className="p-3.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {wallet.transactionsCount ?? 0} records
                  </span>
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-max border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> {wallet.status || "ACTIVE"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      onClick={() => onDeposit(wallet)}
                      size="xs"
                      variant="outline"
                      title="Deposit Credit to Wallet (إيداع رصيد)"
                      className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <PlusCircle className="h-3 w-3 me-1" />
                      Deposit
                    </Button>
                    <Button
                      onClick={() => onDebit(wallet)}
                      size="xs"
                      variant="outline"
                      title="Debit / Deduct from Wallet (خصم رصيد)"
                      className="h-7 px-2 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <MinusCircle className="h-3 w-3 me-1" />
                      Debit
                    </Button>
                    <Button
                      onClick={() => onViewLedger(wallet)}
                      size="xs"
                      variant="gold"
                      title="View Full Ledger History (عرض كشف الحساب)"
                      className="h-7 px-2 text-xs font-bold gap-1 shadow-xs"
                    >
                      <History className="h-3 w-3" />
                      Ledger
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
