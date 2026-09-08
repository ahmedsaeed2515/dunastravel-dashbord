"use client";

import { Booking } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getFrontendTourUrl } from "@/lib/frontend-urls";
import { useRestoreBooking } from "../../hooks/useBookings";
import { useBookingDetail } from "../../hooks/useBookingDetail";
import {
  FileText,
  RefreshCcw,
  Paperclip,
  Plus,
  User,
  Calendar,
  Users,
  CreditCard,
  Building2,
  FileCheck,
  Globe,
  ShieldCheck,
  MessageSquareQuote,
  Loader2,
  ExternalLink,
  Download,
  Receipt,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Compass,
  MessageCircle,
  History,
  FolderArchive,
  UserCheck,
  Clock,
  CheckCircle2
} from "lucide-react";
import { BookingInvoiceDialog } from "../Dialogs/BookingInvoiceDialog";
import { useState } from "react";
import { AddNoteDialog } from "../Dialogs/AddNoteDialog";
import { AddAttachmentDialog } from "../Dialogs/AddAttachmentDialog";
import { EditPassengersDialog } from "../Dialogs/EditPassengersDialog";
import { RecordPaymentDialog } from "../Dialogs/RecordPaymentDialog";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface BookingDetailsDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLangMeta = (lang?: string | null) => {
  switch ((lang || "").toLowerCase()) {
    case "es": return { flag: "🇪🇸", name: "Spanish (Español)" };
    case "pt": return { flag: "🇧🇷", name: "Portuguese (Português)" };
    case "it": return { flag: "🇮🇹", name: "Italian (Italiano)" };
    case "en": return { flag: "🇬🇧", name: "English" };
    case "ar": return { flag: "🇪🇬", name: "العربية (Arabic)" };
    default: return { flag: "🌐", name: lang || "International" };
  }
};

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

export function BookingDetailsDrawer({ booking: initialBooking, open, onOpenChange }: BookingDetailsDrawerProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  
  const tBookings = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { mutate: restoreBooking, isPending: isRestoring } = useRestoreBooking();

  // Fetch full live detailed booking object from backend
  const { data: detailedBooking, isLoading: isDetailLoading } = useBookingDetail(
    open ? initialBooking?.referenceCode : undefined
  );

  const booking = detailedBooking || initialBooking;

  const [noteOpen, setNoteOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [passengerOpen, setPassengerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!booking) return null;

  const totalNum = parseFloat(String(booking.totalAmount || "0")) || 0;
  const paidNum = parseFloat(String(booking.paidAmount || "0")) || 0;
  const balanceDue = Math.max(0, totalNum - paidNum);
  const percentPaid = totalNum > 0 ? Math.min(100, Math.round((paidNum / totalNum) * 100)) : 0;
  const isFullyPaid = totalNum > 0 && paidNum >= totalNum;
  const langMeta = getLangMeta(booking.language);

  const copyRefCode = () => {
    if (navigator.clipboard && booking.referenceCode) {
      navigator.clipboard.writeText(booking.referenceCode);
      setCopiedRef(true);
      toast.success(isAr ? "تم نسخ رقم الحجز" : "Booking reference copied");
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // WhatsApp helper
  const cleanPhone = (booking.billingInfo?.phone || booking.user?.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("00") ? cleanPhone.slice(2) : cleanPhone}` : null;

  // Tour title resolution
  const tourTitle = booking.tour?.titleJsonb && typeof booking.tour.titleJsonb === "object"
    ? (booking.tour.titleJsonb as Record<string, string>)[locale] ||
      (booking.tour.titleJsonb as Record<string, string>)["ar"] ||
      (booking.tour.titleJsonb as Record<string, string>)["en"] ||
      booking.tourSlug
    : (booking.tourNameEn || booking.tourSlug || "Tour");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        dir={isAr ? "rtl" : "ltr"}
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 flex flex-col gap-0 border-s border-border/80 bg-background text-foreground shadow-2xl"
      >
        
        {/* ── LUXURY HEADER BANNER ── */}
        <SheetHeader className="p-6 pb-4 border-b border-border/70 bg-card/60 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            
            {/* Booking Title, Ref & Badges */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Language Tag */}
                <span title={langMeta.name} className="px-2 py-0.5 rounded-md text-xs bg-muted/80 border border-border/60 flex items-center gap-1">
                  <span>{langMeta.flag}</span>
                  <span className="font-semibold text-[11px]">{langMeta.name.split(" ")[0]}</span>
                </span>

                {/* Reference Code with Copy */}
                <button
                  type="button"
                  onClick={copyRefCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-mono font-bold text-sm transition-colors cursor-pointer group"
                  title={isAr ? "انقر لنسخ المرجع" : "Click to copy reference"}
                >
                  <span>{booking.referenceCode}</span>
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />}
                </button>

                {/* Status Badge */}
                <StatusBadge status={booking.status} />

                {/* Booking Type */}
                {booking.bookingType && booking.bookingType !== "BOOKING" && (
                  <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-amber-500/30 text-amber-500 bg-amber-500/10">
                    {booking.bookingType}
                  </Badge>
                )}

                {isDetailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </div>

              {/* Tour Name */}
              <SheetTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {tourTitle}
              </SheetTitle>

              <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{tCommon("createdAt")}: {formatDateSafe(booking.createdAt, "MMM do, yyyy h:mm a")}</span>
                {booking.tour?.category && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-foreground">{booking.tour.category}</span>
                  </>
                )}
              </SheetDescription>
            </div>

            {/* Price & Action Buttons */}
            <div className={`flex flex-col ${isAr ? "items-start sm:items-end" : "items-end"} gap-2`}>
              <div className="font-mono text-2xl font-black text-foreground">
                {totalNum > 0 ? (
                  formatAmountSafe(booking.totalAmount, booking.currency)
                ) : (
                  <span className="text-amber-500 text-base font-sans font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    {isAr ? "حسب الطلب (On Request)" : "On Request"}
                  </span>
                )}
              </div>

              {/* Primary Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Official Invoice Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-bold border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 bg-amber-500/5 cursor-pointer shadow-xs"
                  onClick={() => setInvoiceOpen(true)}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isAr ? "الفاتورة الرسمية" : "Official Invoice"}</span>
                </Button>

                {/* Full Page Link */}
                <Link href={`/${locale}/admin/bookings/${booking.referenceCode}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs font-semibold border-border hover:bg-muted cursor-pointer"
                    title={isAr ? "فتح في صفحة مستقلة" : "Open in dedicated page"}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isAr ? "صفحة مستقلة" : "Full Page"}</span>
                  </Button>
                </Link>

                {/* Retry / Restore if Cancelled */}
                {booking.status === "CANCELLED" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 h-8 text-xs cursor-pointer font-bold"
                    onClick={() => restoreBooking(booking.referenceCode)}
                    disabled={isRestoring}
                  >
                    <RefreshCcw className="h-3 w-3" />
                    <span>{tCommon("retry")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ── FINANCIAL PROGRESS BAR & STATS STRIP ── */}
          <div className="mt-4 pt-3.5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-muted-foreground text-[11px] block">{isAr ? "المدفوع:" : "Paid:"}</span>
                <strong className="text-emerald-500 font-mono text-sm">${paidNum.toFixed(2)}</strong>
              </div>
              <div className="border-s border-border/50 ps-4">
                <span className="text-muted-foreground text-[11px] block">{isAr ? "المتبقي للتحصيل:" : "Due:"}</span>
                <strong className={balanceDue > 0 ? "text-amber-500 font-mono text-sm" : "text-muted-foreground font-mono text-sm"}>
                  ${balanceDue.toFixed(2)}
                </strong>
              </div>
              <div className="border-s border-border/50 ps-4">
                <span className="text-muted-foreground text-[11px] block">{isAr ? "حالة السداد:" : "Settlement:"}</span>
                <span className={`font-bold text-[11px] ${isFullyPaid ? "text-emerald-500" : "text-amber-500"}`}>
                  {isFullyPaid 
                    ? (isAr ? "مسدد بالكامل ✓" : "Fully Settled ✓") 
                    : (totalNum === 0 ? (isAr ? "حسب العرض" : "On Request") : (isAr ? "قيد التحصيل" : "Pending"))}
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="flex items-center gap-2.5 justify-end">
              <div className="flex-1 sm:w-32 h-2.5 bg-muted rounded-full overflow-hidden border border-border/40">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentPaid >= 100 ? "bg-emerald-500" : percentPaid > 0 ? "bg-amber-500" : "bg-muted-foreground/30"
                  }`}
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-foreground shrink-0">{percentPaid}%</span>
            </div>
          </div>
        </SheetHeader>

        {/* ── TABS NAVIGATION ── */}
        <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col">
          <div className="px-6 pt-2 border-b border-border/60 bg-muted/20">
            <TabsList className="w-full flex h-11 justify-start gap-1 bg-transparent p-0 overflow-x-auto">
              
              {/* Tab 1: Details */}
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "تفاصيل الحجز" : "Reservation"}</span>
              </TabsTrigger>

              {/* Tab 2: Client */}
              <TabsTrigger 
                value="customer" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "بيانات العميل" : "Client"}</span>
              </TabsTrigger>

              {/* Tab 3: Passengers */}
              <TabsTrigger 
                value="passengers" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "المسافرون" : "Travelers"}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-primary/15 text-primary font-bold">
                  {booking.passengers?.length || booking.passengerCount || 1}
                </span>
              </TabsTrigger>

              {/* Tab 4: Financials & Invoice */}
              <TabsTrigger 
                value="invoice" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "المدفوعات والفاتورة" : "Financials"}</span>
              </TabsTrigger>

              {/* Tab 5: Notes */}
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "ملاحظات الكونسيرج" : "Notes"}</span>
                {Array.isArray(booking.notesList) && booking.notesList.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-500 font-bold">
                    {booking.notesList.length}
                  </span>
                )}
              </TabsTrigger>

              {/* Tab 6: Attachments */}
              <TabsTrigger 
                value="attachments" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <FolderArchive className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "المستندات وقسائم السفر" : "Documents"}</span>
                {Array.isArray(booking.attachments) && booking.attachments.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-foreground font-bold">
                    {booking.attachments.length}
                  </span>
                )}
              </TabsTrigger>

              {/* Tab 7: Timeline */}
              <TabsTrigger 
                value="timeline" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "سجل النشاطات" : "Timeline"}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── SCROLLABLE TAB CONTENTS ── */}
          <ScrollArea className="flex-1 p-6 h-[calc(100vh-250px)]">
            
            {/* ════ TAB 1: RESERVATION & ITINERARY DETAILS ════ */}
            <TabsContent value="summary" className="mt-0 space-y-6">
              
              {/* Tour & Destination Overview */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>{isAr ? "البرنامج والوجهة السياحية" : "Itinerary & Destination"}</span>
                  </h4>

                  {booking.tourSlug && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/admin/tours/${booking.tourSlug}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                      >
                        {isAr ? "عرض في الداشبورد" : "View in Dashboard"} <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-muted-foreground/40">•</span>
                      <a
                        href={getFrontendTourUrl(booking.tourSlug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {isAr ? "عرض بالموقع المباشر 🌐" : "View Live Website 🌐"} <Globe className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-1">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "اسم الجولة / المعرّف:" : "Tour Slug:"}</span>
                    <span className="font-mono text-xs font-semibold text-foreground break-all">{booking.tourSlug || "—"}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "التصنيف:" : "Category:"}</span>
                    <span className="font-bold text-foreground">{booking.tour?.category || (isAr ? "سياحة فاخرة (VIP)" : "Luxury Travel")}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "المدينة والوجهة:" : "Destination:"}</span>
                    <span className="font-bold text-foreground">
                      {[booking.tour?.city, booking.tour?.country].filter(Boolean).join(", ") || (isAr ? "مصر / إقليمي" : "Egypt / Regional")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Travel Schedule & Dates */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{isAr ? "جدول المواعيد والرحلة" : "Travel Schedule & Timings"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="text-xs text-muted-foreground block">{isAr ? "تاريخ وساعة الوصول:" : "Arrival Date & Time:"}</span>
                    <div className="font-bold text-base text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>{formatDateSafe(booking.arrivalDate)}</span>
                      {booking.arrivalTime && (
                        <span className="text-xs font-mono text-muted-foreground">@ {booking.arrivalTime}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                    <span className="text-xs text-muted-foreground block">{isAr ? "تاريخ وساعة المغادرة:" : "Departure Date & Time:"}</span>
                    <div className="font-bold text-base text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>{formatDateSafe(booking.departureDate)}</span>
                      {booking.departureTime && (
                        <span className="text-xs font-mono text-muted-foreground">@ {booking.departureTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmed Transport Method */}
              {booking.transportChoice && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span>{booking.transportChoice.toLowerCase().includes("train") ? "🚄" : "🚌"}</span>
                    <span>{isAr ? "وسيلة النقل المعتمدة في الباقة" : "Confirmed Transport Method"}</span>
                  </h4>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {booking.transportChoice.toLowerCase().includes("train")
                          ? (isAr ? "القطار فائق السرعة الفاخر (High-Speed Luxury Rail)" : "High-Speed Luxury Rail")
                          : (isAr ? "حافلة كونسيرج بانورامية فاخرة (VIP Panoramic Coach)" : "VIP Panoramic Coach")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.transportChoice.toLowerCase().includes("train")
                          ? (isAr ? "المدة المقدرة: ~4 ساعات (خدمة الدرجة الأولى)" : "Duration: ~4 hours (First Class Service)")
                          : (isAr ? "المدة المقدرة: ~6 ساعات (مسار سياحي خاص)" : "Duration: ~6 hours (Private Scenic Route)")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 uppercase">
                      {isAr ? "خيار مؤكد" : "Confirmed"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Guest Breakdown & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Guests */}
                <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{isAr ? "توزيع المسافرين (Guests Breakdown)" : "Guest Breakdown"}</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-xl block mb-0.5">👤</span>
                      <strong className="text-lg font-black text-foreground block font-mono">{booking.adults ?? booking.passengerCount ?? 1}</strong>
                      <span className="text-[11px] text-muted-foreground font-medium">{isAr ? "بالغين" : "Adults"}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-xl block mb-0.5">🧒</span>
                      <strong className="text-lg font-black text-foreground block font-mono">{booking.children ?? 0}</strong>
                      <span className="text-[11px] text-muted-foreground font-medium">{isAr ? "أطفال" : "Children"}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-xl block mb-0.5">👶</span>
                      <strong className="text-lg font-black text-foreground block font-mono">{booking.infants ?? 0}</strong>
                      <span className="text-[11px] text-muted-foreground font-medium">{isAr ? "رضّع" : "Infants"}</span>
                    </div>
                  </div>
                </div>

                {/* Language & Experience */}
                <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>{isAr ? "لغة المرشد والتجربة" : "Language & Experience"}</span>
                  </h4>
                  <div className="space-y-2 pt-1 text-sm">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-xs text-muted-foreground">{isAr ? "لغة الحجز المعتمدة:" : "Booking Language:"}</span>
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <span>{langMeta.flag}</span>
                        <span>{langMeta.name}</span>
                      </span>
                    </div>
                    {booking.activityType && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                        <span className="text-xs text-muted-foreground">{isAr ? "نوع النشاط:" : "Activity Type:"}</span>
                        <span className="font-bold text-foreground">{booking.activityType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests & Client Notes */}
              {(booking.notes || booking.inquiryMessage) && (
                <div className="rounded-xl border border-border/80 p-5 bg-muted/20 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-primary" />
                    <span>{isAr ? "الطلبات الخاصة والرسائل الاستفسارية" : "Special Requests & Inquiry Notes"}</span>
                  </h4>
                  {typeof booking.notes === 'string' && booking.notes && (
                    <div className="p-3.5 rounded-lg bg-background border border-border/60 text-sm whitespace-pre-wrap leading-relaxed">
                      {booking.notes}
                    </div>
                  )}
                  {booking.inquiryMessage && (
                    <div className="p-3.5 rounded-lg bg-background border border-border/60 text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      <span className="text-xs font-bold text-primary block mb-1">
                        {isAr ? "رسالة الاستفسار الأولية من العميل:" : "Initial Inquiry Message:"}
                      </span>
                      {booking.inquiryMessage}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ════ TAB 2: CLIENT & BILLING PARTICULARS ════ */}
            <TabsContent value="customer" className="mt-0 space-y-6">
              
              {/* Lead Customer Contact Card */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>{isAr ? "المسافر الرئيسي وجهة الاتصال (Lead Traveler)" : "Lead Traveler & Contact Information"}</span>
                  </h4>

                  {/* WhatsApp Direct Link Button */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? "مراسلة عبر واتساب" : "Chat on WhatsApp"}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">
                      {isAr ? "الاسم الكامل في جواز السفر:" : "Full Passport Name:"}
                    </span>
                    <span className="font-bold text-base text-foreground">
                      {booking.billingInfo?.fullName || booking.user?.name || "—"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">
                      {isAr ? "البريد الإلكتروني:" : "Email Address:"}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground select-all dir-ltr inline-block">
                      {booking.billingInfo?.email || booking.user?.email || "—"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">
                      {isAr ? "رقم الهاتف / واتساب:" : "Contact Phone:"}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground select-all dir-ltr inline-block">
                      {booking.billingInfo?.phone || booking.user?.phone || "—"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">
                      {isAr ? "الدولة والمدينة:" : "Country & City:"}
                    </span>
                    <span className="font-medium text-foreground">
                      {[booking.billingInfo?.city, booking.billingInfo?.country].filter(Boolean).join(", ") || (isAr ? "غير محدد" : "Not specified")}
                    </span>
                  </div>
                </div>

                {booking.billingInfo?.address && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-sm">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">
                      {isAr ? "عنوان الفوترة المعتمد:" : "Billing Address:"}
                    </span>
                    <span className="font-medium text-foreground">{booking.billingInfo.address}</span>
                  </div>
                )}
              </div>

              {/* Invoice Classification & Tax Particulars */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{isAr ? "تصنيف الفاتورة والبيانات الضريبية" : "Invoice Classification & Tax Info"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block mb-1">{isAr ? "نوع الفاتورة:" : "Invoice Type:"}</span>
                    <Badge variant="outline" className="font-bold text-xs">
                      {booking.billingInfo?.invoiceType === "COMPANY" 
                        ? (isAr ? "شركات / أعمال (B2B)" : "Company") 
                        : (isAr ? "فردي (Personal)" : "Personal")}
                    </Badge>
                  </div>

                  {booking.billingInfo?.companyName && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "اسم الشركة:" : "Company Name:"}</span>
                      <span className="font-bold text-foreground">{booking.billingInfo.companyName}</span>
                    </div>
                  )}

                  {booking.billingInfo?.taxId && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "الرقم الضريبي الموحد:" : "Tax ID / VAT:"}</span>
                      <span className="font-mono text-xs font-bold text-foreground dir-ltr">{booking.billingInfo.taxId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Account on Platform */}
              {booking.user && (
                <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>{isAr ? "الحساب المسجل في المنصة" : "Registered Account on Platform"}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "معرّف المستخدم (ID):" : "User ID:"}</span>
                      <span className="font-mono text-xs text-muted-foreground truncate block select-all">{booking.user.id}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-1">{isAr ? "صلاحية الحساب:" : "Account Role:"}</span>
                      <span className="font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block">
                        {booking.user.role || "USER"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-0.5">{isAr ? "البريد المسجل:" : "Registered Email:"}</span>
                      <span className="font-mono text-xs font-semibold text-foreground dir-ltr block select-all">{booking.user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ════ TAB 3: PASSENGERS MANIFEST ════ */}
            <TabsContent value="passengers" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "المسافرون المسجلون:" : "Registered Travelers:"}{" "}
                    <strong className="text-primary font-mono">{booking.passengers?.length || 0}</strong>
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-8 text-xs font-bold border-border hover:bg-muted cursor-pointer" 
                  onClick={() => setPassengerOpen(true)}
                >
                  {isAr ? "تعديل بيانات المسافرين" : "Edit Travelers"}
                </Button>
              </div>

              {booking.passengers && booking.passengers.length > 0 ? (
                <div className="space-y-3">
                  {booking.passengers.map((p, i) => (
                    <div key={p.id || i} className="border border-border/80 rounded-xl p-4 bg-card/60 shadow-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 font-black text-xs flex items-center justify-center font-mono">
                            {i + 1}
                          </span>
                          <span className="font-bold text-base text-foreground">{p.fullName}</span>
                        </div>
                        {/* Correctly translated passenger status */}
                        <StatusBadge status={p.passengerType || "ADULT"} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-border/40">
                        <div>
                          <span className="block text-[10px] text-muted-foreground mb-0.5">
                            {isAr ? "رقم جواز السفر" : "Passport Number"}
                          </span>
                          <span className="font-mono font-bold text-foreground dir-ltr">
                            {p.passportNumber || (isAr ? "غير مسجل" : "—")}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground mb-0.5">
                            {isAr ? "تاريخ انتهاء الجواز" : "Passport Expiry"}
                          </span>
                          <span className="font-medium text-foreground">{formatDateSafe(p.passportExpiry)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground mb-0.5">
                            {isAr ? "الجنسية" : "Nationality"}
                          </span>
                          <span className="font-semibold text-foreground">{p.nationality || (isAr ? "غير مسجل" : "—")}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground mb-0.5">
                            {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                          </span>
                          <span className="font-medium text-foreground">{formatDateSafe(p.dateOfBirth)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl space-y-2">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs">{isAr ? "لا توجد بيانات مسافرين مفصلة مسجلة بعد." : "No traveler records available yet."}</p>
                  <Button variant="outline" size="sm" onClick={() => setPassengerOpen(true)} className="text-xs">
                    {isAr ? "+ إضافة المسافرين الآن" : "+ Add Travelers Now"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ════ TAB 4: FINANCIALS & PAYMENTS ════ */}
            <TabsContent value="invoice" className="mt-0 space-y-6">
              
              {/* Official Invoice Card */}
              <div className="rounded-xl border border-amber-500/30 p-5 bg-amber-500/5 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {isAr ? "الفاتورة الضريبية الرسمية المعتمدة" : "Official Tax Invoice & Voucher"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={booking.invoice?.status || (isFullyPaid ? "PAID" : "SENT")} />
                    <Button
                      size="sm"
                      onClick={() => setInvoiceOpen(true)}
                      className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{isAr ? "فتح الفاتورة الرسمية" : "View Official Invoice"}</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-1">
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block">{isAr ? "رقم الفاتورة:" : "Invoice Number:"}</span>
                    <span className="font-mono font-bold text-foreground dir-ltr">
                      #{booking.invoice?.invoiceNumber || `INV-2026-${booking.referenceCode.replace(/[^0-9]/g, "") || "0020"}`}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block">{isAr ? "تاريخ الإصدار:" : "Issue Date:"}</span>
                    <span className="font-medium text-foreground">{formatDateSafe(booking.invoice?.createdAt || booking.createdAt)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block">{isAr ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
                    <span className="font-mono font-bold text-foreground dir-ltr">
                      {formatAmountSafe(booking.invoice?.total || booking.totalAmount, booking.currency)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-[11px] text-muted-foreground block">{isAr ? "تاريخ الاستحقاق:" : "Due Date:"}</span>
                    <span className="font-medium text-foreground">{formatDateSafe(booking.invoice?.dueDate || booking.createdAt)}</span>
                  </div>
                </div>

                {booking.invoice?.pdfUrl && (
                  <div className="pt-1">
                    <a
                      href={booking.invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? "تحميل نسخة PDF الرسمية الموقعة" : "Download Official Signed PDF"}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Payments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>
                      {isAr ? "سجل المدفوعات والعمليات البنكية" : "Transaction & Gateway Records"} ({booking.payments?.length || 0})
                    </span>
                  </h4>
                  {balanceDue > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setPaymentOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 h-8 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? "تسجيل دفعة جديدة" : "Record Payment"}</span>
                    </Button>
                  )}
                </div>

                {booking.payments && booking.payments.length > 0 ? (
                  booking.payments.map((p: any, i: number) => (
                    <div key={p.id || i} className="border border-border/80 rounded-xl p-4 flex justify-between items-center bg-card/60 shadow-xs hover:border-border transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{p.isRefund ? (isAr ? "استرداد أموال" : "Refund") : (isAr ? "سداد إلكتروني" : "Payment")}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {isAr ? "عبر" : "via"} {p.method || "GetPayIn Gateway"}
                          </span>
                          <StatusBadge status={p.status || "COMPLETED"} />
                        </div>
                        <div className="text-xs text-muted-foreground dir-ltr text-start font-mono">
                          TX ID: {p.transactionId || p.id || "N/A"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatDateSafe(p.createdAt, "MMM do, yyyy h:mm a")}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className={`font-mono text-base font-black dir-ltr ${p.isRefund ? 'text-red-500' : 'text-emerald-500'}`}>
                          {p.isRefund ? '-' : '+'}{p.currency || 'USD'} {Number(p.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-10 border border-dashed rounded-xl space-y-2">
                    <CreditCard className="w-8 h-8 mx-auto text-muted-foreground/50" />
                    <p className="text-xs">{isAr ? "لا توجد حركات دفع مسجلة حتى الآن." : "No transactions recorded yet."}</p>
                    {balanceDue > 0 && (
                      <Button size="sm" variant="outline" onClick={() => setPaymentOpen(true)} className="text-xs">
                        {isAr ? "تسجيل دفعة يدوية" : "Record Manual Payment"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ════ TAB 5: INTERNAL STAFF CONCIERGE NOTES ════ */}
            <TabsContent value="notes" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "ملاحظات وتوجيهات الكونسيرج الداخلية" : "Internal Concierge Notes"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs font-bold border-border hover:bg-muted cursor-pointer" 
                  onClick={() => setNoteOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5"/>
                  <span>{isAr ? "إضافة ملاحظة" : "Add Note"}</span>
                </Button>
              </div>

              {Array.isArray(booking.notesList) && booking.notesList.length > 0 ? (
                booking.notesList.map((n: any, i: number) => (
                  <div key={n.id || i} className="border border-border/80 rounded-xl p-4 flex flex-col gap-2.5 bg-card/60 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {(n.user?.name || "C")[0]}
                        </div>
                        <span className="font-bold text-xs text-foreground">
                          {n.user?.name || (isAr ? "فريق الكونسيرج" : "Concierge Staff")}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatDateSafe(n.createdAt, "MMM do, yyyy h:mm a")}
                      </span>
                    </div>
                    {/* Proper RTL text alignment for Arabic notes */}
                    <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed font-sans text-start">
                      {n.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs">{isAr ? "لا توجد ملاحظات كونسيرج مسجلة بعد." : "No internal concierge notes recorded yet."}</p>
                  <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)} className="text-xs">
                    {isAr ? "+ إضافة أول ملاحظة" : "+ Add First Note"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ════ TAB 6: ATTACHMENTS & VOUCHERS ════ */}
            <TabsContent value="attachments" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "المستندات وقسائم السفر المرفوعة" : "Uploaded Documents & Vouchers"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs font-bold border-border hover:bg-muted cursor-pointer" 
                  onClick={() => setAttachmentOpen(true)}
                >
                  <Paperclip className="w-3.5 h-3.5"/>
                  <span>{isAr ? "رفع مستند" : "Upload"}</span>
                </Button>
              </div>

              {booking.attachments && booking.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.attachments.map((a: any, i: number) => (
                    <div key={a.id || i} className="border border-border/80 rounded-xl p-3.5 flex flex-col justify-between items-start bg-card/60 shadow-xs hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5 w-full mb-2">
                        <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-bold text-sm truncate w-full" title={a.fileName}>
                          {a.fileName || "Voucher Document"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full pt-1 border-t border-border/40 text-xs">
                        <StatusBadge status={a.documentType || 'DOCUMENT'} />
                        {a.fileUrl && (
                          <a
                            href={a.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>{isAr ? "تنزيل" : "Download"}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl space-y-2">
                  <Paperclip className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs">{isAr ? "لا توجد مستندات أو قسائم مرفوعة حتى الآن." : "No documents or vouchers uploaded yet."}</p>
                  <Button variant="outline" size="sm" onClick={() => setAttachmentOpen(true)} className="text-xs">
                    {isAr ? "+ رفع قسيمة أو تذكرة" : "+ Upload Voucher"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ════ TAB 7: TIMELINE ════ */}
            <TabsContent value="timeline" className="mt-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "سجل العمليات والتدقيق التاريخي" : "Activity & Audit History"}
                </span>
              </div>

              {booking.activityLogs && booking.activityLogs.length > 0 ? (
                <div className={`relative border-s border-border ${isAr ? "me-4 pe-6" : "ms-4 ps-6"} space-y-6 pt-2`}>
                  {booking.activityLogs.map((log: any, i: number) => (
                    <div key={log.id || i} className="relative">
                      <div className={`absolute w-2.5 h-2.5 bg-primary rounded-full top-1.5 ring-4 ring-background ${isAr ? "-right-[31px]" : "-left-[31px]"}`} />
                      <div className="font-bold text-sm text-foreground">
                        {(log.action || "UPDATE").replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {formatDateSafe(log.createdAt, "MMM do, yyyy h:mm a")}
                      </div>
                      {log.description && (
                        <p className="text-xs text-foreground/80 mt-1">{log.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl space-y-2">
                  <History className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs">{isAr ? "لا توجد سجلات نشاط مسجلة بعد." : "No activity logs available."}</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      {/* Dialogs */}
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
      <EditPassengersDialog
        referenceCode={booking.referenceCode}
        initialPassengers={booking.passengers || []}
        open={passengerOpen}
        onOpenChange={setPassengerOpen}
      />
      <RecordPaymentDialog
        referenceCode={booking.referenceCode}
        totalAmount={booking.totalAmount}
        paidAmount={booking.paidAmount}
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
      <BookingInvoiceDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        bookingReferenceCode={booking.referenceCode}
      />
    </Sheet>
  );
}
