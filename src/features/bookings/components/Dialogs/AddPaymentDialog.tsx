"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPayment } from "../../hooks/useBookings";
import { toast } from "sonner";

interface AddPaymentDialogProps {
  referenceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPaymentDialog({ referenceCode, open, onOpenChange }: AddPaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const currency = "USD" as const;
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "POS" | "OTHER_MANUAL">("BANK_TRANSFER");
  const [transactionId, setTransactionId] = useState("");
  
  const { mutate: addPayment, isPending } = useAddPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !transactionId.trim()) {
      toast.error("Please enter a valid amount");
      return;
    }

    addPayment(
      {
        referenceCode,
        data: {
          amount: Number(amount),
          currency,
          method,
          transactionId: transactionId.trim(),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setAmount("");
          setTransactionId("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <p className="text-sm text-muted-foreground">Manual payments are recorded in USD.</p>
          <div className="grid gap-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={(val) => setMethod(val as typeof method)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
                <SelectItem value="OTHER_MANUAL">Other manual method</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN-12345"
              minLength={6}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
