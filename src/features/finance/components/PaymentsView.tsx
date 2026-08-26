"use client";

import { useState } from "react";
import { AlertTriangle, CreditCard, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayments, useReconciliationSummary } from "../hooks/useFinance";

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
  const { data: response, isLoading, refetch, isFetching } = usePayments({
    page: 1,
    limit: 25,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: reconciliation } = useReconciliationSummary();
  const payments = response?.data ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold"><CreditCard className="h-5 w-5 text-amber-500" /> Payments</h2>
          <p className="text-sm text-muted-foreground">Canonical payment attempts and GetPayIn reconciliation state.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <div className="text-muted-foreground">Stale pending</div>
          <div className="mt-1 text-xl font-bold">{reconciliation?.stalePendingCount ?? 0}</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <div className="text-muted-foreground">Refunds pending</div>
          <div className="mt-1 text-xl font-bold">{reconciliation?.pendingRefundCount ?? 0}</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <div className="text-muted-foreground">Missing provider reference</div>
          <div className="mt-1 text-xl font-bold">{reconciliation?.missingReferenceCount ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search booking or transaction reference" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All payment states</option>
          <option value="PENDING">Pending</option>
          <option value="CAPTURED">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="EXPIRED">Expired</option>
          <option value="REFUND_PENDING">Refund pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Booking</th><th className="p-3">Amount</th><th className="p-3">Payment / booking</th><th className="p-3">GetPayIn reference</th><th className="p-3">Created / paid</th><th className="p-3">Issue</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading payments…</td></tr> : null}
            {!isLoading && payments.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No payments match these filters.</td></tr> : null}
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border/60 align-top">
                <td className="p-3 font-medium"><div>{payment.bookingReferenceCode}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{payment.id.slice(0, 8)}</div></td>
                <td className="p-3 font-semibold">{formatMoney(payment.amount, payment.currency)}</td>
                <td className="p-3"><div>{payment.status}</div><div className="mt-1 text-xs text-muted-foreground">Booking: {payment.bookingStatus}</div></td>
                <td className="p-3"><div>{payment.provider || "Historical"}{payment.attemptNumber ? ` · Attempt ${payment.attemptNumber}` : ""}</div><div className="mt-1 max-w-48 truncate font-mono text-xs text-muted-foreground" title={payment.providerPaymentId || payment.transactionId || ""}>{payment.providerPaymentId || payment.transactionId || "—"}</div></td>
                <td className="p-3 text-xs text-muted-foreground"><div>{formatDate(payment.createdAt)}</div><div className="mt-1">Paid: {formatDate(payment.paidAt)}</div></td>
                <td className="p-3 text-xs text-destructive">{payment.failureMessage ? <span className="flex gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{payment.failureMessage}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
