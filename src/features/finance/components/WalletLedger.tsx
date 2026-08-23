"use client";

import { useState } from "react";
import { useWalletTransactions, useWallet, useAddManualTransaction } from "../hooks/useFinance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Landmark, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

interface WalletLedgerProps {
  ownerType: 'USER' | 'COMPANY';
  ownerId: string;
}

export function WalletLedger({ ownerType, ownerId }: WalletLedgerProps) {
  const walletQuery = useWallet(ownerType, ownerId);
  const { data: wallet, isLoading: walletLoading } = walletQuery;
  const transactionsQuery = useWalletTransactions(wallet?.id || "", { enabled: !!wallet?.id });
  const { data: transactions, isLoading: txLoading } = transactionsQuery;
  const addTransaction = useAddManualTransaction();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [description, setDescription] = useState("");
  
  const handleAddTransaction = async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      await addTransaction.mutateAsync({
        ownerType,
        ownerId,
        amount: Number(amount),
        type,
        description
      });
      setIsDialogOpen(false);
      setAmount("");
      setDescription("");
      toast.success("Manual transaction added successfully");
    } catch (e: any) {
      toast.error("Failed to add transaction");
    }
  };

  if (walletQuery.isError || transactionsQuery.isError) {
    return <QueryErrorState message="تعذر تحميل المحفظة من الباك إند." onRetry={() => void Promise.all([walletQuery.refetch(), transactionsQuery.refetch()])} />;
  }

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
                {wallet ? new Intl.NumberFormat("en-US", { style: "currency", currency: wallet.currency }).format(parseFloat(wallet.balance)) : "—"}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Landmark className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)} disabled={!wallet}>
            <Plus className="h-3.5 w-3.5" />
            Add Transaction
          </Button>
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

                const formatDate = (dateStr?: string) => {
                  if (!dateStr) return "";
                  try {
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return "";
                    return format(d, "PPp");
                  } catch {
                    return "";
                  }
                };

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
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.createdAt)}</p>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm">Type</span>
              <Select value={type} onValueChange={(val: any) => setType(val || "CREDIT")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT">Credit (+)</SelectItem>
                  <SelectItem value="DEBIT">Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm">Amount</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm">Description</span>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Refund or manual adjustment"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} disabled={addTransaction.isPending || !amount}>
              {addTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
