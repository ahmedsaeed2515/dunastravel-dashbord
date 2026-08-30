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

interface WalletLedgerProps {
  ownerType: 'USER' | 'COMPANY';
  ownerId: string;
}

export function WalletLedger({ ownerType, ownerId }: WalletLedgerProps) {
  const { data: wallet, isLoading: walletLoading } = useWallet(ownerType, ownerId);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id || "", { enabled: !!wallet?.id });
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

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm backdrop-blur-xl bg-background/60 rounded-2xl">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-muted-foreground">الرصيد الحالي للمحفظة (Wallet Balance)</h3>
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: wallet?.currency || "USD" }).format(parseFloat(wallet?.balance || "0"))}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Landmark className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold">سجل المعاملات والتحويلات المالية</CardTitle>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 font-bold rounded-xl" onClick={() => setIsDialogOpen(true)} disabled={!wallet}>
            <Plus className="h-3.5 w-3.5" />
            إضافة معاملة يدوية ➕
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
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isCredit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {isCredit ? (
                          <ArrowUpRight className={`h-4 w-4 text-emerald-500`} />
                        ) : (
                          <ArrowDownRight className={`h-4 w-4 text-rose-500`} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{tx.referenceType}</p>
                        <p className="text-xs text-muted-foreground">{tx.description || tx.referenceId}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold font-mono text-sm ${isCredit ? 'text-emerald-500' : 'text-foreground'}`}>
                        {isCredit ? "+" : "-"}{amountFormatted}
                      </p>
                      <Badge variant={tx.status === 'COMPLETED' ? 'outline' : 'secondary'} className="mt-1 text-[10px] px-1.5 py-0 font-bold">
                        {tx.status === 'COMPLETED' ? 'مكتمل' : tx.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs font-bold text-muted-foreground">
                لا توجد معاملات مسجلة لهذه المحفظة حتى الآن.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">إضافة معاملة وقيد مالي يدوي</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-xs font-bold">نوع القيد</span>
              <Select value={type} onValueChange={(val: any) => setType(val || "CREDIT")}>
                <SelectTrigger className="col-span-3 rounded-xl font-bold text-xs">
                  <SelectValue placeholder="اختر نوع القيد" />
                </SelectTrigger>
                <SelectContent className="font-bold text-xs">
                  <SelectItem value="CREDIT">إيداع / دائن Credit (+)</SelectItem>
                  <SelectItem value="DEBIT">خصم / مدين Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-xs font-bold">المبلغ</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="col-span-3 rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-xs font-bold">الوصف والبيان</span>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: تسوية يدوية أو استرداد مبلغ للعميل"
                className="col-span-3 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">إلغاء</Button>
            <Button onClick={handleAddTransaction} disabled={addTransaction.isPending || !amount} className="rounded-xl font-bold">
              {addTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ القيد المالي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
