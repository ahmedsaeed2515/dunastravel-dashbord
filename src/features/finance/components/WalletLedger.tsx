"use client";

import { useWalletTransactions, useWallet } from "../hooks/useFinance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Landmark } from "lucide-react";

interface WalletLedgerProps {
  ownerType: 'USER' | 'COMPANY';
  ownerId: string;
}

export function WalletLedger({ ownerType, ownerId }: WalletLedgerProps) {
  const { data: wallet, isLoading: walletLoading } = useWallet(ownerType, ownerId);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id || "", { enabled: !!wallet?.id });

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Current Wallet Balance</h3>
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: wallet?.currency || "USD" }).format(parseFloat(wallet?.balance || "0"))}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Landmark className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {txLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : transactions?.length ? (
              transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                const amountFormatted = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: wallet?.currency || "USD",
                }).format(parseFloat(tx.amount));

                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${isCredit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {isCredit ? (
                          <ArrowUpRight className={`h-4 w-4 text-emerald-500`} />
                        ) : (
                          <ArrowDownRight className={`h-4 w-4 text-rose-500`} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.referenceType}</p>
                        <p className="text-xs text-muted-foreground">{tx.description || tx.referenceId}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(tx.createdAt), "PPp")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isCredit ? 'text-emerald-500' : 'text-foreground'}`}>
                        {isCredit ? "+" : "-"}{amountFormatted}
                      </p>
                      <Badge variant={tx.status === 'COMPLETED' ? 'outline' : 'secondary'} className="mt-1 text-[10px] px-1.5 py-0">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No transactions found for this wallet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
