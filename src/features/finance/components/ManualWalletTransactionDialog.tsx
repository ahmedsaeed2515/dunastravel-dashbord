"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financeApi } from "../api/financeApi";
import { toast } from "sonner";
import { Loader2, PlusCircle, MinusCircle, DollarSign, Wallet, FileText, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { WalletDirectoryItem } from "../types";

interface ManualWalletTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallet: WalletDirectoryItem | null;
  defaultType?: "CREDIT" | "DEBIT";
}

export function ManualWalletTransactionDialog({
  isOpen,
  onClose,
  onSuccess,
  wallet,
  defaultType = "CREDIT",
}: ManualWalletTransactionDialogProps) {
  const tCommon = useTranslations("common");
  const tFinance = useTranslations("finance");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"CREDIT" | "DEBIT">(defaultType);
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount || Number(amount) <= 0) {
      toast.error("Please enter a valid transaction amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      await financeApi.addManualTransaction({
        ownerType: wallet.ownerType,
        ownerId: wallet.ownerId,
        amount: Number(amount),
        type,
        description: description.trim() || (type === "CREDIT" ? "Manual Credit Deposit" : "Manual Debit Adjustment"),
      });

      toast.success(`Successfully ${type === "CREDIT" ? "credited" : "debited"} $${amount} USD to ${wallet.owner?.name || "wallet"}.`);
      onSuccess();
      onClose();
      setAmount("");
      setDescription("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to execute transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wallet) return null;

  const currentBalance = wallet.balance || 0;
  const numAmount = Number(amount) || 0;
  const resultingBalance = type === "CREDIT" ? currentBalance + numAmount : currentBalance - numAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              type === "CREDIT" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
            }`}>
              {type === "CREDIT" ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {type === "CREDIT" ? "Deposit / Credit Wallet (إيداع رصيد بالمحفظة)" : "Debit / Deduct Wallet (خصم من المحفظة)"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Partner: <strong className="text-foreground">{wallet.owner?.name || wallet.id}</strong> ({wallet.ownerType})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Balance Preview Card */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Current Available Balance:</span>
              <span className="font-mono font-bold text-foreground">${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
            </div>
            {numAmount > 0 && (
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-border/40">
                <span className="font-semibold text-muted-foreground">Estimated New Balance:</span>
                <span className={`font-mono font-black ${resultingBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  ${resultingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-muted-foreground">Operation Type (نوع الحركة)</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger className="text-xs font-bold">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT">➕ Credit / Deposit (إيداع رصيد مسبق أو زيادة ائتمان)</SelectItem>
                <SelectItem value="DEBIT">➖ Debit / Deduct (خصم حجز يدوي أو تسوية)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-amount" className="font-semibold text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-primary" /> Amount in USD (المبلغ بالدولار) *
            </Label>
            <Input
              id="tx-amount"
              type="number"
              min={0.01}
              step={0.01}
              max={1000000}
              placeholder="e.g. 5000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className="dir-ltr text-start font-mono text-sm font-bold"
            />
          </div>

          {/* Description / Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-desc" className="font-semibold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary" /> Reason / Bank Reference (سبب الإيداع أو المرجع البنكي)
            </Label>
            <Textarea
              id="tx-desc"
              rows={2}
              placeholder="e.g. Wire Transfer Ref #HSBC-88942 for Q3 advance bookings deposit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs leading-relaxed"
            />
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              variant={type === "CREDIT" ? "gold" : "destructive"}
              size="sm"
              disabled={isSubmitting || !amount || Number(amount) <= 0}
              className="font-bold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm {type === "CREDIT" ? "Deposit" : "Deduction"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
