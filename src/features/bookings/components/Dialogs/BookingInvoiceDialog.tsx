"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  Receipt, 
  Calendar, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText,
  Building,
  MapPin,
  Mail,
  Phone,
  QrCode,
  Globe,
  Share2,
  Check,
  Languages,
  Award,
  Compass
} from "lucide-react";
import { bookingsApi } from "../../api/bookingsApi";
import { generateEtaQrDataUrl } from "../../utils/etaQr";
import { toast } from "sonner";

interface BookingInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingReferenceCode: string;
}

export function BookingInvoiceDialog({
  open,
  onOpenChange,
  bookingReferenceCode,
}: BookingInvoiceDialogProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [invoiceLang, setInvoiceLang] = useState<"ar" | "en">("ar");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!invoice) return;
    const generateQr = async () => {
      try {
        const total = invoice?.total ? parseFloat(String(invoice.total)) : 0;
        const subtotal = invoice?.subtotal
          ? parseFloat(String(invoice.subtotal))
          : total;
        const tax = invoice?.tax
          ? parseFloat(String(invoice.tax))
          : 0;
        const bInfo = invoice?.booking?.billingInfo || invoice?.snapshotJsonb?.billingRecipient || {};
        const url = await generateEtaQrDataUrl({
          sellerName: "Dunas Travel Group (DMC Lic. #1882)",
          taxId: bInfo?.taxId || "482-901-382",
          timestamp: invoice?.issuedAt || invoice?.createdAt || new Date().toISOString(),
          total,
          tax,
        });
        if (active) setQrDataUrl(url);
      } catch (err) {
        console.warn("[BookingInvoiceDialog] ETA QR error:", err);
      }
    };
    generateQr();
    return () => {
      active = false;
    };
  }, [invoice]);

  useEffect(() => {
    if (!open || !bookingReferenceCode) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    bookingsApi
      .getBookingInvoice(bookingReferenceCode)
      .then((data) => {
        if (isMounted) {
          setInvoice(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load invoice:", err);
          setError("تعذر تحميل بيانات الفاتورة الرسمية. يرجى التحقق من اتصال الشبكة.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, bookingReferenceCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/admin/bookings/${bookingReferenceCode}` : "";
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(invoiceLang === "ar" ? "تم نسخ رابط الفاتورة بنجاح" : "Invoice link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!open) return null;

  const b = invoice?.booking || {};
  const snap = invoice?.snapshotJsonb || {};
  const billing = b?.billingInfo || snap?.billingRecipient || {};
  const tour = b?.tour || {};
  const payments = b?.payments || (invoice?.payment ? [invoice.payment] : []);
  const primaryPayment = payments[0];

  const total = invoice?.total ? parseFloat(String(invoice.total)) : 0;
  const subtotal = invoice?.subtotal ? parseFloat(String(invoice.subtotal)) : total;
  const tax = invoice?.tax ? parseFloat(String(invoice.tax)) : 0;
  const paid = b?.paidAmountUsd ? parseFloat(String(b.paidAmountUsd)) : (primaryPayment?.status === "SUCCEEDED" || primaryPayment?.status === "COMPLETED" ? total : 0);
  const balance = Math.max(0, total - paid);

  const status = invoice?.status || b?.status || "SENT";
  const isPaid = status === "PAID" || b?.status === "CONFIRMED" || (total > 0 && paid >= total);

  // Extract titles
  const tourTitleAr = typeof tour?.titleJsonb === "object" ? (tour.titleJsonb?.ar || snap?.tourTitle) : (snap?.tourTitle || "رحلة سياحية فاخرة");
  const tourTitleEn = typeof tour?.titleJsonb === "object" ? (tour.titleJsonb?.en || snap?.tourTitle) : (snap?.tourTitle || "Bespoke Luxury DMC Tour");
  const activeTourTitle = invoiceLang === "ar" ? tourTitleAr : tourTitleEn;

  // Passengers breakdown
  const adultCount = b?.adults ?? snap?.adults ?? 1;
  const childCount = b?.children ?? snap?.children ?? 0;
  const infantCount = b?.infants ?? snap?.infants ?? 0;
  const totalPax = adultCount + childCount + infantCount;

  const invoiceNum = invoice?.invoiceNumber || `INV-2026-${bookingReferenceCode.replace(/[^0-9]/g, "") || "0020"}`;
  const rawIssueDate = invoice?.issuedAt || b?.createdAt;
  const issueDateFormatted = rawIssueDate
    ? new Date(rawIssueDate).toLocaleDateString(
        invoiceLang === "ar" ? "ar-EG" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : "—";
  const dueDateFormatted = invoice?.dueDate 
    ? new Date(invoice.dueDate).toLocaleDateString(invoiceLang === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })
    : issueDateFormatted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[920px] w-[95vw] sm:w-full p-0 overflow-hidden bg-zinc-950/95 border-zinc-800 text-zinc-100 rounded-xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white print:text-black print:max-h-none"
      >
        {/* Screen Top Action Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                {invoiceLang === "ar" 
                  ? "الفاتورة الضريبية الرسمية وقسيمة الحجز المعتمدة" 
                  : "Official Tax Invoice & VIP Voucher"}
              </DialogTitle>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate">
                #{invoiceNum} • Ref: {bookingReferenceCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Language Switcher */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInvoiceLang(prev => prev === "ar" ? "en" : "ar")}
              className="h-8 px-2.5 text-xs font-semibold border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
              title="تبديل لغة الفاتورة / Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{invoiceLang === "ar" ? "English" : "العربية"}</span>
            </Button>

            {/* Share / Copy Link */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="h-8 px-2.5 text-xs font-semibold border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
              title="نسخ الرابط"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (invoiceLang === "ar" ? "تم النسخ" : "Copied") : (invoiceLang === "ar" ? "مشاركة" : "Share")}</span>
            </Button>

            {/* Print / Save PDF */}
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 gap-1.5 cursor-pointer shadow-md shadow-amber-500/10 w-full sm:w-auto justify-center"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{invoiceLang === "ar" ? "طباعة / حفظ PDF" : "Print / Save PDF"}</span>
            </Button>
          </div>
        </div>

        {/* Invoice Viewport Frame */}
        <div className="p-3 sm:p-6 md:p-8 max-h-[calc(92vh-60px)] sm:max-h-[calc(85vh-60px)] overflow-y-auto bg-zinc-950 print:max-h-none print:overflow-visible print:p-0 print:bg-white print:text-black custom-scrollbar">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">جارٍ إنشاء وتحميل وثيقة الفاتورة الرسمية...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm font-semibold bg-red-950/20 border border-red-900/50 rounded-xl p-6">
              {error}
            </div>
          ) : (
            /* ── AUTHENTIC LUXURY INVOICE DOCUMENT SHEET (A4 RATIO READY) ── */
            <div 
              id="printable-luxury-invoice"
              dir={invoiceLang === "ar" ? "rtl" : "ltr"}
              className="relative bg-white text-neutral-900 rounded-xl shadow-2xl p-4 sm:p-8 md:p-10 border border-neutral-200 print:border-none print:shadow-none print:p-8 print:m-0 print:w-full print:rounded-none selection:bg-amber-100"
            >
              {/* Decorative Subtle Luxury Guilloche Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center overflow-hidden">
                <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full border-[15px] sm:border-[20px] border-amber-900 flex items-center justify-center font-serif text-5xl sm:text-8xl font-black text-amber-900 select-none">
                  DUNAS
                </div>
              </div>

              {/* ── HEADER: COMPANY EMBLEM & ACCREDITATION ── */}
              <div className="relative pb-5 sm:pb-6 border-b-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-6">
                <div className="space-y-2 max-w-lg">
                  {/* Brand & Crest */}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-serif font-black text-lg sm:text-xl shadow-md shrink-0">
                      D
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg sm:text-2xl font-black tracking-wider font-serif text-neutral-950">
                          DUNAS TRAVEL GROUP
                        </span>
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          LIC. #1882
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 tracking-wide uppercase mt-0.5">
                        {invoiceLang === "ar" 
                          ? "إدارة الوجهات السياحية والكونسيرج الفاخر • فئة (أ) معتمدة من وزارة السياحة والآثار" 
                          : "Luxury Destination Management Company (DMC) • Category A Ministry Approved"}
                      </p>
                    </div>
                  </div>

                  {/* Corporate Legal Particulars */}
                  <div className="pt-1.5 text-[10px] sm:text-[11px] text-neutral-600 space-y-0.5 leading-relaxed">
                    <p className="break-words">
                      <span className="font-semibold text-neutral-800">
                        {invoiceLang === "ar" ? "رقم التسجيل الضريبي الموحد (ETA):" : "Tax Registration No:"}
                      </span>{" "}
                      <strong className="font-mono text-neutral-950">482-901-382</strong> •{" "}
                      <span className="font-semibold text-neutral-800">
                        {invoiceLang === "ar" ? "السجل التجاري:" : "Commercial Reg:"}
                      </span>{" "}
                      <strong className="font-mono text-neutral-950">104928</strong>
                    </p>
                    <p>
                      {invoiceLang === "ar"
                        ? "المقر الرئيسي: أبراج نايل سيتي، البرج الشمالي، كورنيش النيل، القاهرة، مصر"
                        : "Headquarters: North Tower, Nile City Towers, Corniche El-Nil, Cairo, Egypt"}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono break-words">
                      Branches: Cairo • Luxor • Aswan • Sharm El-Sheikh • Istanbul | www.dunastravel.com
                    </p>
                  </div>
                </div>

                {/* Status Stamp & Official Numbers */}
                <div className={`flex flex-col sm:items-${invoiceLang === "ar" ? "start" : "end"} text-${invoiceLang === "ar" ? "start" : "end"} space-y-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200`}>
                  {/* Official Luxury Status Stamp */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-xs ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-900 border-amber-300"
                  }`}>
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                        <span>{invoiceLang === "ar" ? "مسددة بالكامل (PAID IN FULL)" : "PAID IN FULL"}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                        <span>{invoiceLang === "ar" ? "قيد التحصيل (ON REQUEST)" : "ON REQUEST / PENDING"}</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <div className="font-mono text-xs font-bold text-neutral-950">
                      {invoiceLang === "ar" ? "رقم الفاتورة:" : "Invoice No:"}{" "}
                      <span className="text-amber-700 font-black">{invoiceNum}</span>
                    </div>
                    <div className="font-mono text-xs text-neutral-700">
                      {invoiceLang === "ar" ? "مرجع الحجز:" : "Booking Ref:"}{" "}
                      <span className="font-bold text-neutral-900">#{bookingReferenceCode}</span>
                    </div>
                    <div className="text-[11px] text-neutral-600">
                      {invoiceLang === "ar" ? "تاريخ الإصدار:" : "Issue Date:"} {issueDateFormatted}
                    </div>
                    {invoice?.dueDate && (
                      <div className="text-[11px] text-neutral-600">
                        {invoiceLang === "ar" ? "تاريخ الاستحقاق:" : "Due Date:"} {dueDateFormatted}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── 2-COLUMN META GRID: BILLED TO & ITINERARY VOUCHER ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 my-5 sm:my-6">
                
                {/* Panel 1: Billed To / Client Particulars */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 border-b border-neutral-200 pb-1.5">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>{invoiceLang === "ar" ? "بيانات العميل والجهة المفَوْترة (Billed To)" : "Billed To / Client Particulars"}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-neutral-950">
                      {billing?.fullName || b?.user?.name || (invoiceLang === "ar" ? "العميل الكريم (Guest)" : "Valued Guest")}
                    </div>
                    {billing?.companyName && (
                      <div className="text-neutral-700 font-medium">
                        {invoiceLang === "ar" ? "الشركة:" : "Company:"} <strong>{billing.companyName}</strong>
                        {billing?.taxId && ` (${invoiceLang === "ar" ? "الرقم الضريبي:" : "Tax ID:"} ${billing.taxId})`}
                      </div>
                    )}
                    <div className="text-neutral-600 flex items-center gap-2 font-mono text-[11px] break-all">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{billing?.email || b?.user?.email || "—"}</span>
                    </div>
                    <div className="text-neutral-600 flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{billing?.phone || b?.user?.phone || "—"}</span>
                    </div>
                    {(billing?.city || billing?.country || billing?.address) && (
                      <div className="text-neutral-600 flex items-center gap-2 text-[11px]">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{[billing.address, billing.city, billing.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-neutral-500 pt-1">
                      {invoiceLang === "ar" ? "نوع الفاتورة:" : "Classification:"}{" "}
                      <span className="font-semibold uppercase text-neutral-800">
                        {billing?.invoiceType === "COMPANY" ? (invoiceLang === "ar" ? "شركات / أعمال (B2B)" : "Corporate") : (invoiceLang === "ar" ? "فردي (B2C)" : "Individual")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Itinerary & DMC Voucher Highlights */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 border-b border-neutral-200 pb-1.5">
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>{invoiceLang === "ar" ? "بيانات الرحلة والبرنامج المعتمد (Voucher & Party)" : "Curated DMC Itinerary & Party"}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-neutral-950 leading-snug">
                      {activeTourTitle}
                    </div>
                    <div className="text-neutral-700">
                      <span className="text-neutral-500">{invoiceLang === "ar" ? "فترة الرحلة:" : "Travel Dates:"}</span>{" "}
                      <strong className="font-mono text-neutral-950">
                        {b?.arrivalDate ? String(b.arrivalDate).split("T")[0] : snap?.arrivalDate || "TBD"}
                      </strong>
                      {b?.departureDate && (
                        <span>
                          {" "}{invoiceLang === "ar" ? "إلى" : "to"}{" "}
                          <strong className="font-mono text-neutral-950">{String(b.departureDate).split("T")[0]}</strong>
                        </span>
                      )}
                    </div>
                    <div className="text-neutral-700">
                      <span className="text-neutral-500">{invoiceLang === "ar" ? "المسافرون المشمولون:" : "Party Manifest:"}</span>{" "}
                      <strong className="text-neutral-950">
                        {adultCount} {invoiceLang === "ar" ? "بالغين" : "Adult(s)"}
                        {childCount > 0 && ` • ${childCount} ${invoiceLang === "ar" ? "أطفال" : "Child(ren)"}`}
                        {infantCount > 0 && ` • ${infantCount} ${invoiceLang === "ar" ? "رضّع" : "Infant(s)"}`}
                      </strong>
                    </div>
                    <div className="text-neutral-700 flex items-center justify-between text-[11px] flex-wrap gap-1.5">
                      <span>
                        <span className="text-neutral-500">{invoiceLang === "ar" ? "لغة الإرشاد:" : "Guide Lang:"}</span>{" "}
                        <strong className="text-neutral-950 uppercase">{b?.language || "International"}</strong>
                      </span>
                      {b?.transportChoice && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {b.transportChoice.toLowerCase().includes("train") 
                            ? (invoiceLang === "ar" ? "🚄 قطار فاخر" : "🚄 High-Speed Rail") 
                            : (invoiceLang === "ar" ? "🚌 حافلة VIP" : "🚌 Luxury Coach")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ACCOUNTING ITEMIZED BREAKDOWN TABLE ── */}
              <div className="rounded-xl border border-neutral-300 overflow-hidden mb-6">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse text-xs text-start min-w-[500px]">
                    <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-800">
                      <tr>
                        <th className="p-2.5 sm:p-3.5 text-start font-bold">#</th>
                        <th className="p-2.5 sm:p-3.5 text-start font-bold">
                          {invoiceLang === "ar" ? "بيان الخدمة السياحية والكونسيرج (Curated Service Description)" : "Curated DMC Service Description"}
                        </th>
                        <th className="p-2.5 sm:p-3.5 text-center font-bold">
                          {invoiceLang === "ar" ? "الكمية (Qty)" : "Qty"}
                        </th>
                        <th className="p-2.5 sm:p-3.5 text-end font-bold">
                          {invoiceLang === "ar" ? "سعر الوحدة (Rate)" : "Rate"}
                        </th>
                        <th className="p-2.5 sm:p-3.5 text-end font-bold">
                          {invoiceLang === "ar" ? "المجموع (Amount)" : "Amount"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr className="hover:bg-neutral-50/50">
                        <td className="p-2.5 sm:p-3.5 font-mono text-neutral-500">01</td>
                        <td className="p-2.5 sm:p-3.5">
                          <div className="font-bold text-neutral-950 text-xs sm:text-[13px]">
                            {invoiceLang === "ar"
                              ? "باقة الرحلة السياحية المتكاملة شاملة الإقامة والاستقبال الخاص وتنسيق الكونسيرج"
                              : "All-Inclusive Bespoke DMC Package: Accommodations, Private VIP Transfers & Egyptologist Guide"}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
                            {activeTourTitle} • Ref #{bookingReferenceCode}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3.5 text-center font-mono font-medium text-neutral-800">
                          {totalPax}
                        </td>
                        <td className="p-2.5 sm:p-3.5 text-end font-mono text-neutral-800">
                          ${total > 0 ? (subtotal / Math.max(1, totalPax)).toFixed(2) : "0.00"}
                        </td>
                        <td className="p-2.5 sm:p-3.5 text-end font-mono font-bold text-neutral-950">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                      
                      {/* VAT Row */}
                      <tr className="bg-neutral-50/40">
                        <td className="p-2.5 sm:p-3.5 font-mono text-neutral-500">02</td>
                        <td className="p-2.5 sm:p-3.5">
                          <div className="font-medium text-neutral-800">
                            {invoiceLang === "ar" 
                              ? "ضريبة القيمة المضافة السياحية المعتمدة (VAT 14%)" 
                              : "Statutory Tourism Value Added Tax (VAT 14%)"}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {invoiceLang === "ar" 
                              ? "وفقاً للوائح هيئة الضرائب المصرية ووزارة المالية" 
                              : "Egyptian Tax Authority Statutory Regulation"}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3.5 text-center font-mono text-neutral-500">—</td>
                        <td className="p-2.5 sm:p-3.5 text-end font-mono text-neutral-500">14%</td>
                        <td className="p-2.5 sm:p-3.5 text-end font-mono text-neutral-800">
                          {tax > 0 ? `$${tax.toFixed(2)}` : (invoiceLang === "ar" ? "شاملة (Included)" : "Included")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Payment Method Strip */}
                <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-300 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 sm:gap-6">
                  
                  {/* Payment Details */}
                  <div className="space-y-1.5 text-xs text-neutral-600 max-w-sm w-full md:w-auto">
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                      <CreditCard className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{invoiceLang === "ar" ? "طريقة ومصدر السداد:" : "Settlement Method:"}</span>
                    </div>
                    <p className="text-[11px] text-neutral-700">
                      {primaryPayment?.method || "بطاقة ائتمانية دولية (GetPayIn SSL Secure Gateway)"}
                    </p>
                    {primaryPayment?.transactionId && (
                      <p className="font-mono text-[10px] text-neutral-500 break-all">
                        Transaction ID: {primaryPayment.transactionId}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      {invoiceLang === "ar"
                        ? "جميع المعاملات المالية محمية بتشفير 256-bit SSL ومعتمدة لدى البنك المركزي المصري."
                        : "All transactions are secured with 256-bit SSL encryption and authorized by Central Bank of Egypt regulations."}
                    </p>
                  </div>

                  {/* Numbers Grid */}
                  <div className="w-full md:w-72 space-y-2 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-neutral-200">
                    <div className="flex justify-between text-neutral-600">
                      <span>{invoiceLang === "ar" ? "المجموع الفرعي (Subtotal):" : "Subtotal:"}</span>
                      <span className="font-mono font-medium text-neutral-950">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-neutral-600">
                      <span>{invoiceLang === "ar" ? "ضريبة القيمة المضافة (VAT):" : "VAT (14%):"}</span>
                      <span className="font-mono font-medium text-neutral-950">
                        {tax > 0 ? `$${tax.toFixed(2)}` : (invoiceLang === "ar" ? "شاملة (Included)" : "Included")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black pt-2 border-t-2 border-neutral-300 text-neutral-950">
                      <span className="text-amber-800">{invoiceLang === "ar" ? "الإجمالي الكلي (Total):" : "Total Amount:"}</span>
                      <span className="font-mono text-base sm:text-lg text-amber-800 font-black">${total.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-emerald-700 font-bold">{invoiceLang === "ar" ? "المبلغ المدفوع (Paid):" : "Amount Paid:"}</span>
                      <span className="font-mono text-emerald-700 font-bold">${paid.toFixed(2)}</span>
                    </div>

                    {balance > 0 && (
                      <div className="flex justify-between text-xs pt-0.5 text-amber-700 font-bold">
                        <span>{invoiceLang === "ar" ? "المتبقي للتحصيل (Due):" : "Balance Due:"}</span>
                        <span className="font-mono font-black">${balance.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── BOTTOM SECURITY, ETA QR & LEGAL ASSURANCE ── */}
              <div className="pt-5 border-t border-neutral-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 text-[11px] text-neutral-600">
                
                {/* Legal Certification Guarantee */}
                <div className="space-y-1.5 max-w-md text-start">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {invoiceLang === "ar"
                        ? "وثيقة رسمية معتمدة ومؤمنة رقمياً (ETA Certified E-Invoice)"
                        : "Official ETA Certified Digital Tax Document & Voucher"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-relaxed">
                    {invoiceLang === "ar"
                      ? "تم إصدار هذه الفاتورة إلكترونياً وهي معتمدة ومسجلة رسمياً لدى مصلحة الضرائب المصرية ووزارة السياحة والآثار برقم ترخيص 1882 (فئة أ). مطابقة للوائح الفاتورة الإلكترونية."
                      : "Electronically issued and registered with Egyptian Tax Authority (ETA) and Ministry of Tourism License #1882 Category A. Fully compliant with electronic invoicing standards."}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-medium">
                    24/7 VIP Concierge Support: concierge@dunastravel.com | +20 100 414 6843
                  </p>
                </div>

                {/* Digital Verification ETA QR Box */}
                <div className="flex items-center justify-between sm:justify-start gap-3.5 p-3 rounded-xl border border-neutral-300 bg-neutral-50 shrink-0 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-white rounded-lg p-1 border border-neutral-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="ETA E-Invoice QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-12 h-12 text-amber-800" />
                    )}
                  </div>
                  <div className="text-[10px] space-y-0.5 text-start">
                    <div className="font-bold text-neutral-900">
                      {invoiceLang === "ar" ? "فحص الرمز الضريبي" : "ETA E-INVOICE"}
                    </div>
                    <div className="font-mono text-neutral-500 text-[9px]">SCAN TO VERIFY</div>
                    <div className="font-mono text-emerald-700 font-bold text-[10px]">AUTHENTIC DMC</div>
                    <div className="text-[9px] text-neutral-400">Lic. #1882 / Cat. A</div>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory Line */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-dashed border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-[10px] text-neutral-500 font-mono">
                <div>
                  <span>ISSUED BY: DUNAS CONCIERGE AUTOMATED BILLING SUITE 2.0</span>
                </div>
                <div className="text-start sm:text-end w-full sm:w-auto">
                  <div className="w-40 border-b border-neutral-400 mb-1 hidden sm:block ms-auto" />
                  <span>AUTHORIZED FINANCIAL OFFICER / DMC SEAL</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
