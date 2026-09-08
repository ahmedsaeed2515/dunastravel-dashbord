"use client";

import React, { useState, useEffect } from "react";
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
  QrCode
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

  useEffect(() => {
    let active = true;
    if (!invoice) return;
    const generateQr = async () => {
      try {
        const total = invoice?.total ? parseFloat(String(invoice.total)) : 0;
        const subtotal = invoice?.subtotal
          ? parseFloat(String(invoice.subtotal))
          : total / 1.14;
        const tax = invoice?.tax
          ? parseFloat(String(invoice.tax))
          : total - subtotal;
        const bInfo = invoice?.booking?.billingInfo || invoice?.snapshotJsonb?.billingRecipient || {};
        const url = await generateEtaQrDataUrl({
          sellerName: "Dunas Travel (DMC Lic. #1882)",
          taxId: bInfo?.taxId || "692-481-209",
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
          setError("تعذر تحميل بيانات الفاتورة. يرجى المحاولة مرة أخرى.");
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

  if (!open) return null;

  const b = invoice?.booking || {};
  const snap = invoice?.snapshotJsonb || {};
  const billing = b?.billingInfo || snap?.billingRecipient || {};
  const tour = b?.tour || {};
  const payment = invoice?.payment || b?.payments?.[0];

  const subtotal = invoice?.subtotal ? parseFloat(String(invoice.subtotal)) : 0;
  const tax = invoice?.tax ? parseFloat(String(invoice.tax)) : 0;
  const total = invoice?.total ? parseFloat(String(invoice.total)) : 0;
  const paid = b?.paidAmountUsd ? parseFloat(String(b.paidAmountUsd)) : (payment?.status === "SUCCEEDED" ? total : 0);
  const balance = Math.max(0, total - paid);

  const status = invoice?.status || b?.status || "SENT";
  const isPaid = status === "PAID" || b?.status === "CONFIRMED" || paid >= total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[860px] w-full p-0 overflow-hidden bg-background border-border rounded-2xl shadow-2xl print:border-none print:shadow-none print:p-0 print:max-w-none"
      >
        {/* Screen Controls Header */}
        <div className="px-6 py-3.5 border-b border-border bg-card/70 backdrop-blur-md flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <DialogTitle className="text-base font-bold">
              الفاتورة الضريبية الرسمية • Official Tax Invoice & Voucher
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="gap-1.5 h-8 text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </Button>
          </div>
        </div>

        {/* Invoice Printable Viewport */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto space-y-6 print:max-h-none print:overflow-visible print:p-8 print:bg-white print:text-black">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">جارٍ تحميل بيانات الفاتورة الرسمية...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive text-sm font-semibold">
              {error}
            </div>
          ) : (
            <div className="space-y-6 text-xs text-foreground print:text-black" id="printable-invoice">
              {/* Top Luxury Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border/80 print:border-neutral-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-wider font-serif text-amber-500 print:text-amber-800">
                      DUNAS TRAVEL GROUP
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-500 print:text-black">
                      LIC. #1882
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground print:text-neutral-600 font-medium">
                    Licensed Destination Management Company (DMC) • Tourism Ministry Approved
                  </p>
                  <p className="text-[11px] text-muted-foreground print:text-neutral-600">
                    Tax Registration No: <strong className="font-mono text-foreground print:text-black">482-901-382</strong> • Cairo • Luxor • Aswan • Istanbul
                  </p>
                  <p className="text-[11px] text-muted-foreground print:text-neutral-600">
                    Headquarters: Nile City Towers, Corniche El Nil, Cairo, Egypt
                  </p>
                </div>

                <div className="sm:text-end space-y-1">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1">
                    {isPaid ? (
                      <span className="text-emerald-500 border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> مسددة بالكامل (PAID)
                      </span>
                    ) : (
                      <span className="text-amber-500 border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> قيد التحصيل (PENDING)
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-foreground print:text-black">
                    رقم الفاتورة: {invoice?.invoiceNumber || "INV-2026-TEMP"}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground print:text-neutral-700">
                    رقم الحجز: #{b?.referenceCode || bookingReferenceCode}
                  </div>
                  <div className="text-[11px] text-muted-foreground print:text-neutral-600">
                    تاريخ الإصدار: {new Date(invoice?.issuedAt || b?.createdAt || Date.now()).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* 2-Columns: Billed To & Tour Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Information */}
                <div className="p-4 rounded-xl border border-border/80 bg-card/40 print:bg-neutral-50 print:border-neutral-200 space-y-2">
                  <div className="text-[11px] font-bold text-amber-500 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>بيانات العميل والفوترة (Billed To)</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-foreground print:text-black">
                      {billing?.fullName || b?.user?.name || "العميل الكريم (Guest)"}
                    </div>
                    {billing?.companyName && (
                      <div className="text-muted-foreground print:text-neutral-700">
                        الشركة: <strong className="text-foreground print:text-black">{billing.companyName}</strong>
                        {billing?.taxId && ` (الرقم الضريبي: ${billing.taxId})`}
                      </div>
                    )}
                    <div className="text-muted-foreground print:text-neutral-700 flex items-center gap-1.5 font-mono text-[11px]">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span>{billing?.email || b?.user?.email || "—"}</span>
                    </div>
                    <div className="text-muted-foreground print:text-neutral-700 flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>{billing?.phone || b?.user?.phone || "—"}</span>
                    </div>
                    {(billing?.city || billing?.country) && (
                      <div className="text-muted-foreground print:text-neutral-700 flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{[billing.address, billing.city, billing.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tour & Party Schedule */}
                <div className="p-4 rounded-xl border border-border/80 bg-card/40 print:bg-neutral-50 print:border-neutral-200 space-y-2">
                  <div className="text-[11px] font-bold text-amber-500 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تفاصيل الرحلة والمسافرين (Itinerary & Party)</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-foreground print:text-black">
                      {snap?.tourTitle || (typeof tour?.titleJsonb === "object" ? tour.titleJsonb?.ar || tour.titleJsonb?.en : "رحلة سياحية فاخرة")}
                    </div>
                    <div className="text-muted-foreground print:text-neutral-700">
                      تاريخ الوصول: <strong className="text-foreground print:text-black font-mono">{b?.arrivalDate ? String(b.arrivalDate).split("T")[0] : snap?.arrivalDate || "TBD"}</strong>
                      {b?.departureDate && ` — المغادرة: ${String(b.departureDate).split("T")[0]}`}
                    </div>
                    <div className="text-muted-foreground print:text-neutral-700">
                      عدد المسافرين: <strong className="text-foreground print:text-black">{b?.adults || snap?.adults || 1} بالغين</strong>
                      {(b?.children > 0 || snap?.children > 0) && ` • ${b?.children || snap?.children} أطفال`}
                      {(b?.infants > 0 || snap?.infants > 0) && ` • ${b?.infants || snap?.infants} رضّع`}
                    </div>
                    {b?.language && (
                      <div className="text-muted-foreground print:text-neutral-700">
                        لغة المرشد السياحي: <strong className="text-foreground print:text-black uppercase">{b.language}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Accounting Table */}
              <div className="rounded-xl border border-border/80 overflow-hidden print:border-neutral-300">
                <table className="w-full text-start border-collapse text-xs">
                  <thead className="bg-muted/60 print:bg-neutral-100 border-b border-border/80 print:border-neutral-300">
                    <tr>
                      <th className="p-3 text-start font-bold">الوصف (Curated Service Description)</th>
                      <th className="p-3 text-center font-bold">العدد (Qty)</th>
                      <th className="p-3 text-end font-bold">سعر الوحدة (Rate)</th>
                      <th className="p-3 text-end font-bold">المجموع (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 print:divide-neutral-200">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold">
                          باقة الرحلة السياحية المتكاملة شاملة الإقامة والاستقبال الخاص
                        </div>
                        <div className="text-[11px] text-muted-foreground print:text-neutral-600">
                          {snap?.tourTitle || "Bespoke VIP Travel Experience"}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono">
                        {(b?.adults || snap?.adults || 1) + (b?.children || snap?.children || 0)}
                      </td>
                      <td className="p-3 text-end font-mono">
                        ${((subtotal) / Math.max(1, (b?.adults || 1))).toFixed(2)}
                      </td>
                      <td className="p-3 text-end font-mono font-bold">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                    {tax > 0 && (
                      <tr>
                        <td className="p-3">
                          <div className="font-medium">ضريبة القيمة المضافة السياحية المعتمدة (VAT 14%)</div>
                          <div className="text-[10px] text-muted-foreground print:text-neutral-600">
                            Statutory Egyptian Tourism Authority VAT
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono">—</td>
                        <td className="p-3 text-end font-mono">14%</td>
                        <td className="p-3 text-end font-mono">${tax.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="p-4 bg-card/40 print:bg-neutral-50 border-t border-border/80 print:border-neutral-300 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted-foreground print:text-neutral-600">
                      طريقة السداد: <strong className="text-foreground print:text-black">{payment?.method || "بطاقة ائتمانية (GetPayIn SSL)"}</strong>
                    </div>
                    {payment?.id && (
                      <div className="text-[10px] text-muted-foreground font-mono print:text-neutral-600">
                        رقم العملية البنكية: {payment.id}
                      </div>
                    )}
                  </div>

                  <div className="w-64 space-y-1.5 text-xs text-end">
                    <div className="flex justify-between text-muted-foreground print:text-neutral-600">
                      <span>المجموع الفرعي (Subtotal):</span>
                      <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground print:text-neutral-600">
                      <span>الضريبة المعتمدة (Tax):</span>
                      <span className="font-mono">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-foreground print:text-black pt-1 border-t border-border/60 print:border-neutral-300">
                      <span className="text-amber-500 print:text-black">الإجمالي الكلي (Total):</span>
                      <span className="font-mono text-base text-amber-500 print:text-black">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-emerald-500 font-bold">المدفوع (Paid):</span>
                      <span className="font-mono text-emerald-500 font-bold">${paid.toFixed(2)}</span>
                    </div>
                    {balance > 0 && (
                      <div className="flex justify-between text-xs text-destructive font-bold">
                        <span>المتبقي للتحصيل (Due):</span>
                        <span className="font-mono">${balance.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee, Security Seal & QR Code */}
              <div className="pt-4 border-t border-border/80 print:border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground print:text-neutral-600">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500 print:text-black">
                    <ShieldCheck className="w-4 h-4" />
                    <span>وثيقة رسمية معتمدة ومؤمنة رقمياً</span>
                  </div>
                  <p className="leading-relaxed">
                    تم إصدار هذه الفاتورة إلكترونياً وهي معتمدة من وزارة السياحة المصرية. لا تتطلب ختماً ورقياً يدوياً في حال تطابق رمز الـ QR الرقمي.
                  </p>
                  <p>
                    خدمة كونسيرج كبار الشخصيات على مدار الساعة: concierge@dunastravel.com | +20 100 000 0000
                  </p>
                </div>

                {/* Digital Verification QR Box */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/80 bg-card/60 print:bg-white print:border-neutral-300">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-sm print:border-neutral-400">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="ETA E-Invoice QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-amber-500 print:text-black" />
                    )}
                  </div>
                  <div className="text-[10px] space-y-0.5">
                    <div className="font-bold text-foreground print:text-black">التحقق الرقمي الفوري</div>
                    <div className="font-mono text-muted-foreground">SCAN TO VERIFY</div>
                    <div className="font-mono text-emerald-500 font-bold">AUTHENTIC DMC</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
