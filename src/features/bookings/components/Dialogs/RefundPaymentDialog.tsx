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
import { useRefundPayment } from "../../hooks/useBookings";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface RefundPaymentDialogProps {
  paymentId: string;
  referenceCode: string;
  originalAmount?: number | string;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RefundPaymentDialog({
  paymentId,
  referenceCode,
  originalAmount = 0,
  currency = "USD",
  isOpen,
  onClose,
}: RefundPaymentDialogProps) {
  const maxRefundable = Number(originalAmount) || 0;
  const [amount, setAmount] = useState<string>(String(maxRefundable));
  const [reason, setReason] = useState<string>("");

  const refundMutation = useRefundPayment();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setAmount(String(maxRefundable));
      setReason("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("يرجى إدخال مبلغ استرداد صالح أكبر من الصفر");
      return;
    }

    if (parsedAmount > maxRefundable + 0.01) {
      toast.error(`المبلغ المراد استرداده ($${parsedAmount}) يتجاوز قيمة الدفعة الأصلية ($${maxRefundable})`);
      return;
    }

    if (!reason.trim()) {
      toast.error("يرجى كتابة سبب طلب الاسترداد لتوثيقه في السجل المالي");
      return;
    }

    await refundMutation.mutateAsync({
      paymentId,
      referenceCode,
      data: {
        amount: parsedAmount,
        reason: reason.trim(),
      },
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">
                استرداد مالي (Process Refund)
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                كود الحجز: {referenceCode} • معرف المعاملة: {paymentId.slice(0, 8)}...
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 my-2 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تنبيه مالي خاص بالمدير العام (SUPER_ADMIN)</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            سيتم تنفيذ الاسترداد عبر بوابة الدفع وتحديث رصيد الحجز تلقائياً. لا يمكن التراجع عن هذه العملية بعد تأكيدها.
          </p>
          <div className="pt-1 text-foreground font-bold flex justify-between">
            <span>القيمة القصوى القابلة للاسترداد:</span>
            <span className="font-mono text-red-600 dark:text-red-400">{currency} ${maxRefundable.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refund-amount" className="text-xs font-bold">
              المبلغ المراد استرداده ({currency}) *
            </Label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefundable}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="ps-7 font-mono font-bold text-sm rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-reason" className="text-xs font-bold">سبب الاسترداد *</Label>
            <Textarea
              id="refund-reason"
              placeholder="مثال: إلغاء بناءً على طلب العميل مع خصم الرسوم الإدارية..."
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-medium"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={refundMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold gap-1.5"
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  جاري معالجة الاسترداد...
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  تأكيد خصم واسترداد المبلغ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
