"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageHelpTooltip } from "@/components/shared/ui/PageHelpTooltip";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";
import { useRestoreBooking, useUpdateBookingStatus, useSoftDeleteBooking } from "@/features/bookings/hooks/useBookings";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CreditCard,
  Edit,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  Receipt,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  User,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { getFrontendTourUrl } from "@/lib/frontend-urls";
import { BookingInvoiceDialog } from "@/features/bookings/components/Dialogs/BookingInvoiceDialog";
import { RecordPaymentDialog } from "@/features/bookings/components/Dialogs/RecordPaymentDialog";
import { EditPassengersDialog } from "@/features/bookings/components/Dialogs/EditPassengersDialog";
import { AddNoteDialog } from "@/features/bookings/components/Dialogs/AddNoteDialog";
import { AddAttachmentDialog } from "@/features/bookings/components/Dialogs/AddAttachmentDialog";
import { EditBookingDrawer } from "@/features/bookings/components/Drawers/EditBookingDrawer";
import { toast } from "sonner";
import { format } from "date-fns";

const formatDateSafe = (dateStr?: string | Date | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
};

const formatAmountSafe = (val?: string | number, currency = "USD") => {
  const num = typeof val === "number" ? val : parseFloat(val || "0");
  return isNaN(num)
    ? "$0.00"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(num);
};

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: bookingRef } = use(params);
  const isAr = locale === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const { data: booking, isLoading, isError, refetch } = useBookingDetail(bookingRef);
  const { mutate: restoreBooking, isPending: isRestoring } = useRestoreBooking();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus();
  const deleteBooking = useSoftDeleteBooking();

  const [copied, setCopied] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [passengerOpen, setPassengerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const handleCopyRef = () => {
    if (booking?.referenceCode) {
      navigator.clipboard.writeText(booking.referenceCode);
      setCopied(true);
      toast.success(isAr ? "تم نسخ كود الحجز بنجاح" : "Booking reference copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف الحجز ${booking.referenceCode}؟`
      : `Are you sure you want to delete booking ${booking.referenceCode}?`;
    if (window.confirm(confirmMsg)) {
      await deleteBooking.mutateAsync(booking.referenceCode);
      toast.success(isAr ? "تم حذف الحجز" : "Booking deleted");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {isAr ? "جاري تحميل تفاصيل الحجز الفاخر..." : "Loading luxury booking details..."}
        </p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="space-y-6 pb-12">
        <Link href={`/${locale}/admin/bookings`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <BackArrow className="w-4 h-4" />
            {isAr ? "العودة لكافة الحجوزات" : "Back to Bookings"}
          </Button>
        </Link>
        <Card className="border-destructive/30 bg-destructive/5 text-center py-12">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              {isAr ? "الحجز غير موجود أو تم حذفه" : "Booking Not Found or Deleted"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isAr
                ? `لم يتم العثور على أي حجز يحمل المرجع "${bookingRef}". يرجى التحقق من الرقم والمحاولة مرة أخرى.`
                : `No booking record found matching reference "${bookingRef}". Please check the ID and try again.`}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 me-2" />
                {isAr ? "إعادة المحاولة" : "Try Again"}
              </Button>
              <Link href={`/${locale}/admin/bookings`}>
                <Button size="sm">
                  {isAr ? "سجل الحجوزات" : "Bookings Directory"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalNum = parseFloat(String(booking.totalAmount || "0")) || 0;
  const paidNum = parseFloat(String(booking.paidAmount || "0")) || 0;
  const balanceDue = Math.max(0, totalNum - paidNum);
  const percentPaid = totalNum > 0 ? Math.min(100, Math.round((paidNum / totalNum) * 100)) : (paidNum > 0 ? 100 : 0);

  const tourTitle =
    (typeof booking.tour?.titleJsonb === "object" && booking.tour?.titleJsonb !== null
      ? (booking.tour.titleJsonb as Record<string, string>)[locale] ||
        (booking.tour.titleJsonb as Record<string, string>)["en"] ||
        (booking.tour.titleJsonb as Record<string, string>)["ar"]
      : null) ||
    booking.tourNameEn ||
    booking.tourSlug ||
    "—";

  const customerName = booking.billingInfo?.fullName || booking.user?.name || (isAr ? "عميل غير مسجل" : "Guest Traveler");
  const customerEmail = booking.billingInfo?.email || booking.user?.email || "—";
  const customerPhone = booking.billingInfo?.phone || booking.user?.phone || "—";
  const location = [booking.billingInfo?.city, booking.billingInfo?.country].filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* ── Top Bar Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/bookings`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/80">
              <BackArrow className="w-4 h-4" />
              <span>{isAr ? "كافة الحجوزات" : "All Bookings"}</span>
            </Button>
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              {isAr ? "لوحة التحكم الرئيسية" : "Executive Dashboard"}
            </Button>
          </Link>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold"
            onClick={() => setInvoiceOpen(true)}
          >
            <Receipt className="w-4 h-4" />
            <span>{isAr ? "الفاتورة الرسمية" : "Official Invoice"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
            onClick={() => setPaymentOpen(true)}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? "تسجيل دفعة" : "Record Payment"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 font-bold"
            onClick={() => setEditOpen(true)}
          >
            <Edit className="w-4 h-4" />
            <span>{isAr ? "تعديل الحجز" : "Edit Booking"}</span>
          </Button>

          {booking.status === "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => restoreBooking(booking.referenceCode)}
              disabled={isRestoring}
            >
              <RefreshCcw className="w-4 h-4" />
              <span>{isAr ? "استعادة الحجز" : "Restore"}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title={isAr ? "حذف الحجز" : "Delete Booking"}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Executive Header Banner ── */}
      <Card className="border-border/80 bg-gradient-to-r from-card via-card to-muted/20 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-primary dir-ltr">
                  {booking.referenceCode}
                </h1>
                <PageHelpTooltip description={isAr ? "تفاصيل الحجز الكاملة — استعراض بيانات المسافرين، الفواتير، المدفوعات، سجل التعديلات، وتحديث حالة الحجز." : "Comprehensive booking details — travelers, invoices, payments, audit history, and lifecycle status."} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleCopyRef}
                  title={isAr ? "نسخ المرجع" : "Copy reference"}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <StatusBadge status={booking.status} />
                {booking.bookingType && booking.bookingType !== "BOOKING" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {booking.bookingType}
                  </span>
                )}
              </div>
              <p className="text-base font-semibold text-foreground flex items-center gap-2">
                <span>{tourTitle}</span>
              </p>
              <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {isAr ? "تاريخ الحجز:" : "Booked on:"} {formatDateSafe(booking.createdAt, "PPP p")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {isAr ? "لغة الحجز:" : "Language:"} {booking.language?.toUpperCase() || "EN"}
                </span>
              </div>
            </div>

            {/* Financial Quick Glance */}
            <div className="flex flex-col items-end gap-2 bg-muted/40 p-4 rounded-xl border border-border/60 min-w-[240px]">
              <div className="text-xs text-muted-foreground">{isAr ? "الإجمالي الكلي" : "Total Booking Value"}</div>
              <div className="text-3xl font-bold font-mono dir-ltr text-foreground">
                {totalNum > 0 ? (
                  formatAmountSafe(booking.totalAmount, booking.currency)
                ) : (
                  <span className="text-amber-500 text-xl font-sans font-bold">
                    {isAr ? "حسب الطلب (On Request)" : "On Request (Custom Quote)"}
                  </span>
                )}
              </div>
              <div className="w-full flex items-center justify-between text-xs pt-2 border-t border-border/40 gap-4">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {isAr ? "المدفوع:" : "Paid:"} <strong className="font-mono dir-ltr">${paidNum.toFixed(2)}</strong>
                </span>
                <span className={balanceDue > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}>
                  {isAr ? "المتبقي:" : "Due:"} <strong className="font-mono dir-ltr">${balanceDue.toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Tour details, Passengers, Financials, Notes */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tour & Destination Overview */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {isAr ? "تفاصيل الرحلة والوجهة السياحية" : "Tour & Itinerary Details"}
              </CardTitle>
              {booking.tourSlug && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${locale}/admin/tours/${booking.tourSlug}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    {isAr ? "عرض في الداشبورد 📊" : "View in Dashboard"} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-muted-foreground/50">•</span>
                  <a
                    href={getFrontendTourUrl(booking.tourSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    {isAr ? "الموقع المباشر 🌐" : "Live Website"} <Globe className="w-3 h-3" />
                  </a>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "اسم الرحلة" : "Tour Title"}</span>
                  <span className="font-semibold text-foreground">{tourTitle}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "معرف المسار (Slug)" : "Tour Slug"}</span>
                  <span className="font-mono text-xs text-foreground dir-ltr">{booking.tourSlug || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "التصنيف" : "Category"}</span>
                  <span className="font-medium text-foreground">{booking.tour?.category || "Luxury Package"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "تاريخ الوصول / بدء الرحلة" : "Arrival Date"}</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {formatDateSafe(booking.arrivalDate)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "تاريخ المغادرة" : "Departure Date"}</span>
                  <span className="font-medium text-foreground">
                    {formatDateSafe(booking.departureDate)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{isAr ? "خيار النقل والمواصلات" : "Transportation"}</span>
                  <span className="font-medium text-foreground">
                    {booking.transportChoice || (isAr ? "نقل VIP خاص" : "Private VIP Transport")}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                  <span className="font-bold text-foreground block">{isAr ? "ملاحظات الحجز الإضافية:" : "Booking Notes:"}</span>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passenger Manifest */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {isAr ? "بيان أسماء المسافرين (Passenger Manifest)" : "Passenger Manifest"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? `إجمالي الركاب: ${booking.passengerCount || booking.passengers?.length || 1} مسافر`
                    : `Total Passengers: ${booking.passengerCount || booking.passengers?.length || 1}`}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => setPassengerOpen(true)}
              >
                <Edit className="w-3.5 h-3.5" />
                {isAr ? "تعديل الركاب" : "Edit Passengers"}
              </Button>
            </CardHeader>
            <CardContent>
              {booking.passengers && booking.passengers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? "#" : "#"}</TableHead>
                      <TableHead>{isAr ? "الاسم بالكامل" : "Full Name"}</TableHead>
                      <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isAr ? "رقم الجواز" : "Passport"}</TableHead>
                      <TableHead>{isAr ? "الجنسية" : "Nationality"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.passengers.map((p, idx) => (
                      <TableRow key={p.id || idx}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-semibold text-xs">{p.fullName}</TableCell>
                        <TableCell>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted border">
                            {p.passengerType}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.passportNumber || "—"}</TableCell>
                        <TableCell className="text-xs">{p.nationality || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "لم يتم تسجيل بيانات تفصيلية لكل راكب حتى الآن. يمكنك إضافتها بالنقر على 'تعديل الركاب'."
                    : "No detailed passenger passports recorded yet. Click 'Edit Passengers' to add them."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Transactions & Invoicing */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {isAr ? "العمليات المالية وسجل الدفع" : "Financial Operations & Payments"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr ? "متابعة المدفوعات المسجلة وحالة الفواتير الصادرة" : "Track received payments and invoices"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => setInvoiceOpen(true)}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  {isAr ? "عرض الفاتورة" : "View Invoice"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => setPaymentOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? "تسجيل دفعة" : "Record Payment"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {booking.payments && booking.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? "المبلغ" : "Amount"}</TableHead>
                      <TableHead>{isAr ? "طريقة الدفع" : "Method"}</TableHead>
                      <TableHead>{isAr ? "رقم المعاملة" : "Tx ID"}</TableHead>
                      <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.payments.map((pmt) => (
                      <TableRow key={pmt.id}>
                        <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 dir-ltr">
                          ${pmt.amount} {pmt.currency}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{pmt.method}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground dir-ltr">
                          {pmt.transactionId || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {pmt.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateSafe(pmt.createdAt, "MMM do, p")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  {isAr ? "لا توجد مدفوعات مسجلة بعد لهذا الحجز." : "No recorded payments yet for this booking."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes & Attachments */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                {isAr ? "الملاحظات الإدارية والمستندات" : "Internal Notes & Attachments"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setNoteOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? "إضافة ملاحظة" : "Add Note"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setAttachmentOpen(true)}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {isAr ? "إرفاق ملف" : "Attach File"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {booking.notesList && booking.notesList.length > 0 ? (
                <div className="space-y-3">
                  {booking.notesList.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {isAr ? "ملاحظة إدارية" : "Admin Note"}
                        </span>
                        <span>{formatDateSafe(n.createdAt, "MMM do, p")}</span>
                      </div>
                      <p className="text-muted-foreground">{n.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-xs text-muted-foreground">
                  {isAr ? "لا توجد ملاحظات إدارية مسجلة بعد." : "No admin notes added yet."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Customer Card, Quick Actions */}
        <div className="space-y-6">

          {/* Customer & Contact Details Card */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {isAr ? "بيانات العميل ومعلومات التواصل" : "Customer Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
                <div className="font-bold text-sm text-foreground">{customerName}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="dir-ltr truncate font-mono">{customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="dir-ltr font-mono">{customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{location}</span>
                </div>
              </div>

              {booking.billingInfo?.companyName && (
                <div>
                  <span className="text-muted-foreground block">{isAr ? "اسم الشركة:" : "Company:"}</span>
                  <span className="font-semibold text-foreground">{booking.billingInfo.companyName}</span>
                </div>
              )}

              {booking.billingInfo?.taxId && (
                <div>
                  <span className="text-muted-foreground block">{isAr ? "الرقم الضريبي:" : "Tax ID:"}</span>
                  <span className="font-mono text-foreground dir-ltr">{booking.billingInfo.taxId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Booking Management Card */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {isAr ? "إدارة حالة الحجز" : "Booking Status Management"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {isAr ? "تغيير الحالة السريع" : "Change Status"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={booking.status === "CONFIRMED" ? "default" : "outline"}
                    className="text-xs font-bold"
                    onClick={() => updateStatus({ referenceCode: booking.referenceCode, data: { status: "CONFIRMED" } })}
                    disabled={isUpdatingStatus || booking.status === "CONFIRMED"}
                  >
                    {isAr ? "تأكيد الحجز ✅" : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant={booking.status === "COMPLETED" ? "default" : "outline"}
                    className="text-xs font-bold"
                    onClick={() => updateStatus({ referenceCode: booking.referenceCode, data: { status: "COMPLETED" } })}
                    disabled={isUpdatingStatus || booking.status === "COMPLETED"}
                  >
                    {isAr ? "إتمام الرحلة 🏁" : "Complete"}
                  </Button>
                  <Button
                    size="sm"
                    variant={booking.status === "PENDING" ? "default" : "outline"}
                    className="text-xs font-bold"
                    onClick={() => updateStatus({ referenceCode: booking.referenceCode, data: { status: "PENDING" } })}
                    disabled={isUpdatingStatus || booking.status === "PENDING"}
                  >
                    {isAr ? "قيد الانتظار ⏳" : "Pending"}
                  </Button>
                  <Button
                    size="sm"
                    variant={booking.status === "CANCELLED" ? "destructive" : "outline"}
                    className="text-xs font-bold"
                    onClick={() => updateStatus({ referenceCode: booking.referenceCode, data: { status: "CANCELLED" } })}
                    disabled={isUpdatingStatus || booking.status === "CANCELLED"}
                  >
                    {isAr ? "إلغاء الحجز ❌" : "Cancel"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Modals & Drawers Layer ── */}
      <BookingInvoiceDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        bookingReferenceCode={booking.referenceCode}
      />

      <RecordPaymentDialog
        referenceCode={booking.referenceCode}
        totalAmount={booking.totalAmount}
        paidAmount={booking.paidAmount}
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />

      <EditPassengersDialog
        referenceCode={booking.referenceCode}
        initialPassengers={booking.passengers || []}
        open={passengerOpen}
        onOpenChange={setPassengerOpen}
      />

      <AddNoteDialog
        referenceCode={booking.referenceCode}
        open={noteOpen}
        onOpenChange={setNoteOpen}
      />

      <AddAttachmentDialog
        referenceCode={booking.referenceCode}
        open={attachmentOpen}
        onOpenChange={setAttachmentOpen}
      />

      <EditBookingDrawer
        booking={booking}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
