"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CreditCard, Download, RefreshCw, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayments, useReconciliationSummary } from "../hooks/useFinance";
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
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("ref") || "";
  const urlHighlight = searchParams.get("highlight") || urlSearch;

  const [search, setSearch] = useState(urlSearch);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(urlHighlight || null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  // React to URL query param changes
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setPage(1);
    }
    if (urlHighlight) {
      setActiveHighlight(urlHighlight);
    }
  }, [urlSearch, urlHighlight]);

  // React to cross-component custom highlight event
  useEffect(() => {
    const handleHighlightEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.referenceCode) {
        setSearch(detail.referenceCode);
        setActiveHighlight(detail.referenceCode);
        setPage(1);
      } else if (detail?.highlightId) {
        setActiveHighlight(detail.highlightId);
      }
    };
    window.addEventListener("dunas:notification-highlight", handleHighlightEvent);
    return () => window.removeEventListener("dunas:notification-highlight", handleHighlightEvent);
  }, []);

  const { data: response, isLoading, refetch, isFetching } = usePayments({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  });
  const { data: reconciliation } = useReconciliationSummary();
  const payments = response?.data ?? [];
  const meta = response?.meta;
  const totalPages = Math.max(1, meta?.totalPages || 1);

  // Auto-scroll to highlighted payment row when available
  useEffect(() => {
    if (activeHighlight && payments.length > 0) {
      const timer = setTimeout(() => {
        const normalized = activeHighlight.trim().toLowerCase();
        const match = payments.find(
          (p) =>
            p.bookingReferenceCode?.toLowerCase() === normalized ||
            p.id.toLowerCase() === normalized ||
            p.providerPaymentId?.toLowerCase() === normalized
        );

        if (match) {
          const rowDomId = `payment-row-${(match.bookingReferenceCode || match.id).toLowerCase()}`;
          const targetRow = document.getElementById(rowDomId);
          if (targetRow) {
            targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        const fallbackRow = document.getElementById(`payment-row-${normalized}`);
        if (fallbackRow) {
          fallbackRow.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          const section = document.getElementById("payments-table-section");
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeHighlight, payments]);

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
    } catch {
      toast.error("حدث خطأ أثناء تصدير التقرير");
    }
  };

  return (
    <section id="payments-table-section" className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5 scroll-mt-20">
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
            {payments.map((payment) => {
              const isHighlighted = Boolean(
                activeHighlight &&
                (
                  payment.bookingReferenceCode?.toLowerCase() === activeHighlight.toLowerCase() ||
                  payment.id.toLowerCase() === activeHighlight.toLowerCase() ||
                  payment.providerPaymentId?.toLowerCase() === activeHighlight.toLowerCase()
                )
              );

              const rowDomId = `payment-row-${(payment.bookingReferenceCode || payment.id).toLowerCase()}`;

              return (
                <tr
                  key={payment.id}
                  id={rowDomId}
                  className={`border-b border-border/60 align-top transition-all duration-700 ${
                    isHighlighted
                      ? "notification-target-glow ring-2 ring-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.55)] scale-[1.006] z-10 rounded-lg"
                      : "hover:bg-muted/10"
                  }`}
                >
                  <td className="p-3 font-bold font-mono">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{payment.bookingReferenceCode}</span>
                      {isHighlighted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs animate-bounce">
                          <Sparkles className="w-3 h-3" />
                          الإشعار المحدد
                        </span>
                      )}
                    </div>
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
                </td>
              </tr>
            );
            })}
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
    </section>
  );
}
