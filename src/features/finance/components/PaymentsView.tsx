"use client";

import { useState } from "react";
import { AlertTriangle, CreditCard, Download, RefreshCw, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePayments, useReconciliationSummary, useRefundPayment } from "../hooks/useFinance";
import type { PaymentRecord } from "../types";
import { toast } from "sonner";

const formatMoney = (amount: string, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount || 0));

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "—";

export function PaymentsView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const limit = 25;

  const { data: response, isLoading, refetch, isFetching } = usePayments({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: reconciliation } = useReconciliationSummary();
  const refundMutation = useRefundPayment();
  const payments = response?.data ?? [];
  const meta = response?.meta;
  const totalPages = Math.max(1, meta?.totalPages || 1);

  const openRefund = (payment: PaymentRecord) => {
    const remaining = Math.max(
      0,
      Number(payment.amount) - Number(payment.refundedAmount || 0),
    );
    setRefundTarget(payment);
    setRefundAmount(remaining.toFixed(2));
    setRefundReason("");
  };

  const submitRefund = async () => {
    if (!refundTarget) return;
    const amount = Number(refundAmount);
    const remaining =
      Number(refundTarget.amount) - Number(refundTarget.refundedAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      toast.error(
        `يجب أن يكون مبلغ الاسترجاع بين 0.01 و ${remaining.toFixed(2)} ${refundTarget.currency}`,
      );
      return;
    }
    if (refundReason.trim().length < 3) {
      toast.error("يرجى إدخال سبب الاسترجاع (3 أحرف على الأقل)");
      return;
    }
    await refundMutation.mutateAsync({
      paymentId: refundTarget.id,
      amount,
      reason: refundReason.trim(),
      idempotencyKey: `refund:${crypto.randomUUID()}`,
    });
    setRefundTarget(null);
  };

  const handleExportCsv = () => {
    if (!payments.length) {
      toast.error("لا توجد بيانات مدفوعات للتصدير حالياً");
      return;
    }

    try {
      const headers = [
        "رقم الحجز",
        "معرف المعاملة",
        "المبلغ",
        "العملة",
        "حالة الدفع",
        "حالة الحجز",
        "بوابة الدفع",
        "مرجع البوابة",
        "تاريخ الإنشاء",
        "تاريخ الدفع",
        "ملاحظات أو أخطاء",
      ];

      const rows = payments.map((p) => [
        `"${p.bookingReferenceCode || ""}"`,
        `"${p.id || ""}"`,
        `"${p.amount || 0}"`,
        `"${p.currency || "USD"}"`,
        `"${p.status === "CAPTURED" ? "مدفوع ومؤكد" : p.status === "PENDING" ? "قيد الانتظار" : p.status}"`,
        `"${p.bookingStatus || ""}"`,
        `"${p.provider || "GetPayIn"}"`,
        `"${p.providerPaymentId || p.transactionId || ""}"`,
        `"${p.createdAt ? new Date(p.createdAt).toISOString() : ""}"`,
        `"${p.paidAt ? new Date(p.paidAt).toISOString() : ""}"`,
        `"${(p.failureMessage || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `payments_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير تقرير المدفوعات بنجاح بصيغة CSV");
    } catch (err: any) {
      toast.error("حدث خطأ أثناء تصدير التقرير");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-amber-500" /> المدفوعات والمعاملات المالية (Payments)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            محاولات الدفع الرسمية وحالة التسوية المالية مع بوابة GetPayIn.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="font-bold rounded-xl gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 cursor-pointer"
          >
            <Download className="h-4 w-4" /> تصدير تقرير CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-bold rounded-xl cursor-pointer"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> تحديث البيانات
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <div className="text-muted-foreground font-bold">معاملات معلقة قديمة (Stale)</div>
          <div className="mt-1 text-xl font-bold font-mono text-amber-600">{reconciliation?.stalePendingCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <div className="text-muted-foreground font-bold">مبالغ قيد الاسترداد (Refunds)</div>
          <div className="mt-1 text-xl font-bold font-mono text-amber-600">{reconciliation?.pendingRefundCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <div className="text-muted-foreground font-bold">بدون مرجع بوابة الدفع</div>
          <div className="mt-1 text-xl font-bold font-mono text-amber-600">{reconciliation?.missingReferenceCount ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-xl font-medium text-xs"
            placeholder="بحث برقم الحجز أو مرجع العملية..."
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold"
        >
          <option value="">كافة حالات الدفع</option>
          <option value="PENDING">قيد الانتظار (Pending)</option>
          <option value="CAPTURED">مدفوع ومؤكد (Paid)</option>
          <option value="FAILED">فشل الدفع (Failed)</option>
          <option value="EXPIRED">منتهي الصلاحية (Expired)</option>
          <option value="REFUND_PENDING">استرداد قيد المراجعة</option>
          <option value="REFUNDED">تم الاسترداد (Refunded)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-right text-xs">
          <thead className="border-b text-xs font-bold text-muted-foreground bg-muted/30">
            <tr>
              <th className="p-3">رقم الحجز</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">حالة الدفع / الحجز</th>
              <th className="p-3">مرجع البوابة GetPayIn</th>
              <th className="p-3">تاريخ الإنشاء / الدفع</th>
              <th className="p-3">الملاحظات والأخطاء</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-bold">
                  جاري تحميل سجلات الدفع...
                </td>
              </tr>
            ) : null}
            {!isLoading && payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-bold">
                  لا توجد عمليات دفع تطابق معايير البحث.
                </td>
              </tr>
            ) : null}
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border/60 align-top hover:bg-muted/10">
                <td className="p-3 font-bold font-mono">
                  <div>{payment.bookingReferenceCode}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.id.slice(0, 8)}</div>
                </td>
                <td className="p-3 font-bold font-mono text-emerald-600">
                  {formatMoney(payment.amount, payment.currency)}
                </td>
                <td className="p-3">
                  <div className="font-bold">
                    {payment.status === "CAPTURED"
                      ? "مدفوع ومؤكد"
                      : payment.status === "PENDING"
                      ? "قيد الانتظار"
                      : payment.status}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">الحجز: {payment.bookingStatus}</div>
                </td>
                <td className="p-3">
                  <div className="font-bold">
                    {payment.provider || "Historical"}
                    {payment.attemptNumber ? ` · محاولة ${payment.attemptNumber}` : ""}
                  </div>
                  <div
                    className="mt-1 max-w-48 truncate font-mono text-[10px] text-muted-foreground"
                    title={payment.providerPaymentId || payment.transactionId || ""}
                  >
                    {payment.providerPaymentId || payment.transactionId || "—"}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    PayLink status: {payment.providerStatus || "—"}
                  </div>
                </td>
                <td className="p-3 text-[10px] text-muted-foreground font-mono">
                  <div>{formatDate(payment.createdAt)}</div>
                  <div className="mt-1">Expires: {formatDate(payment.checkoutExpiresAt)}</div>
                  <div className="mt-1">Checked: {formatDate(payment.lastProviderCheckAt)}</div>
                  <div className="mt-1">دفع: {formatDate(payment.paidAt)}</div>
                </td>
                <td className="p-3 text-xs text-destructive">
                  {payment.failureMessage ? (
                    <span className="flex gap-1 items-center">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {payment.failureMessage}
                    </span>
                  ) : (
                    "—"
                  )}
                  {payment.status === "CAPTURED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRefund(payment)}
                      className="mt-2 rounded-xl gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Refund
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between py-3 px-2 border-t text-xs">
        <div className="text-muted-foreground font-bold">
          إجمالي العمليات المعروضة: {payments.length} عملية
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground ml-2">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={isLoading || page <= 1}
            className="rounded-xl font-bold cursor-pointer"
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={isLoading || page >= totalPages}
            className="rounded-xl font-bold cursor-pointer"
          >
            التالي
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(refundTarget)} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund through PayLink</DialogTitle>
            <DialogDescription>
              This sends a real provider refund. A smaller amount creates a partial refund; the full remaining amount closes the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Amount ({refundTarget?.currency})</Label>
              <Input
                id="refund-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={refundAmount}
                onChange={(event) => setRefundAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason</Label>
              <Textarea
                id="refund-reason"
                maxLength={500}
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
                placeholder="Customer-approved cancellation or adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)} disabled={refundMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRefund} disabled={refundMutation.isPending}>
              {refundMutation.isPending ? "Processing…" : "Confirm provider refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
