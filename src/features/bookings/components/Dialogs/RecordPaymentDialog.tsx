"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordManualPayment, useCancelWithRefund } from "../../hooks/useBookings";
import { DollarSign, Loader2, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface RecordPaymentDialogProps {
  referenceCode: string;
  totalAmount?: number | string;
  paidAmount?: number | string;
  isOpen: boolean;
  onClose: () => void;
  mode?: "payment" | "refund";
}

export function RecordPaymentDialog({
  referenceCode,
  totalAmount = 0,
  paidAmount = 0,
  isOpen,
  onClose,
  mode = "payment",
}: RecordPaymentDialogProps) {
  const isRefundMode = mode === "refund";
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  const balanceDue = Math.max(0, total - paid);

  const [amount, setAmount] = useState<string>(isRefundMode ? String(paid) : (balanceDue > 0 ? String(balanceDue) : "0"));
  const [method, setMethod] = useState<string>("CASH");
  const [transactionId, setTransactionId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const recordPaymentMutation = useRecordManualPayment();
  const cancelWithRefundMutation = useCancelWithRefund();
  const isSubmitting = recordPaymentMutation.isPending || cancelWithRefundMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setAmount(isRefundMode ? String(paid) : (balanceDue > 0 ? String(balanceDue) : "0"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRefundMode) {
      if (!notes.trim()) {
        toast.error("يرجى كتابة سبب الاسترداد والإلغاء");
        return;
      }
      await cancelWithRefundMutation.mutateAsync({
        referenceCode,
        reason: notes.trim(),
      });
      onClose();
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("يرجى إدخال مبلغ دفع صالح أكبر من الصفر");
      return;
    }

    if (parsedAmount > balanceDue + 0.01 && balanceDue > 0) {
      toast.error(`المبلغ المدخل ($${parsedAmount}) يتجاوز الرصيد المستحق ($${balanceDue})`);
      return;
    }

    await recordPaymentMutation.mutateAsync({
      referenceCode,
      data: {
        amount: parsedAmount,
        method,
        transactionId: transactionId.trim() || undefined,
        notes: notes.trim() || undefined,
      },
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isRefundMode
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}>
              {isRefundMode ? <RotateCcw className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isRefundMode ? "استرداد مالي وإلغاء الحجز (Refund & Cancel)" : "تسجيل دفعة مالية (Manual Payment)"}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                كود المرجع: {referenceCode}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 my-2 flex justify-between items-center text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">إجمالي الحجز:</span>
            <span className="font-bold text-sm font-mono">${total.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">المدفوع حالياً:</span>
            <span className="font-bold text-sm font-mono text-emerald-600 dark:text-emerald-400">${paid.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">
              {isRefundMode ? "مبلغ الاسترداد:" : "المتبقي المستحق:"}
            </span>
            <span className={`font-bold text-sm font-mono ${
              isRefundMode ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              ${isRefundMode ? paid.toFixed(2) : balanceDue.toFixed(2)}
            </span>
          </div>
        </div>

        {isRefundMode && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>سيتم تحويل حالة الحجز إلى ملغي (CANCELLED) وتسجيل حركة استرداد مالي بقيمة ${paid.toFixed(2)} وعكس العمولات تلقائياً.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRefundMode && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className="text-xs font-bold">
                  المبلغ المراد تحصيله (USD) *
                </Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balanceDue > 0 ? balanceDue : undefined}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="ps-7 font-mono font-bold text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payment-method" className="text-xs font-bold">طريقة الدفع *</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="payment-method" className="rounded-xl text-xs font-medium">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-medium">
                    <SelectItem value="CASH">نقداً (Cash)</SelectItem>
                    <SelectItem value="BANK_TRANSFER">تحويل بنكي (Bank Wire Transfer)</SelectItem>
                    <SelectItem value="POS">نقطة بيع بالبطاقة (POS Terminal / Credit Card)</SelectItem>
                    <SelectItem value="PAYLINK">بوابة Paylink (Online Checkout)</SelectItem>
                    <SelectItem value="CHEQUE">شيك مصرفي (Cheque)</SelectItem>
                    <SelectItem value="WALLET">خصم من محفظة الوكيل (Agent Wallet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transaction-id" className="text-xs font-bold">رقم المعاملة / الإيصال البنكي (اختياري)</Label>
                <Input
                  id="transaction-id"
                  placeholder="مثال: TXN-9842145 أو رقم الشيك"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="rounded-xl text-xs font-mono"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="payment-notes" className="text-xs font-bold">
              {isRefundMode ? "سبب الاسترداد والإلغاء (إلزامي) *" : "ملاحظات التحصيل (اختياري)"}
            </Label>
            <Textarea
              id="payment-notes"
              placeholder={isRefundMode ? "اكتب سبب الاسترداد والإلغاء المالي بالتفصيل..." : "مثال: تم استلام المبلغ في مقر الشركة / إيصال رقم..."}
              rows={isRefundMode ? 3 : 2}
              required={isRefundMode}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-medium"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isRefundMode
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              } rounded-xl text-xs font-bold gap-1.5`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isRefundMode ? "جاري تنفيذ الاسترداد..." : "جاري تسجيل الدفع..."}
                </>
              ) : (
                <>
                  {isRefundMode ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isRefundMode ? "تأكيد الاسترداد والإلغاء" : "تأكيد وتسجيل الدفعة"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
