"use client";

import { Booking } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
  Download
} from "lucide-react";
import { useState } from "react";
import { AddNoteDialog } from "../Dialogs/AddNoteDialog";
import { AddAttachmentDialog } from "../Dialogs/AddAttachmentDialog";
import { EditPassengersDialog } from "../Dialogs/EditPassengersDialog";
import { RecordPaymentDialog } from "../Dialogs/RecordPaymentDialog";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

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
    case "ar": return { flag: "🇪🇬", name: "Arabic (العربية)" };
    default: return { flag: "🌐", name: lang || "International" };
  }
};

const formatDateSafe = (dateStr?: string | Date | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, fmt);
  } catch {
    return "N/A";
  }
};

const formatAmountSafe = (val?: string | number, currency = "USD") => {
  const num = typeof val === "number" ? val : parseFloat(val || "0");
  return isNaN(num)
    ? "$0.00"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(num);
};

export function BookingDetailsDrawer({ booking: initialBooking, open, onOpenChange }: BookingDetailsDrawerProps) {
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

  if (!booking) return null;

  const totalNum = parseFloat(String(booking.totalAmount || "0")) || 0;
  const paidNum = parseFloat(String(booking.paidAmount || "0")) || 0;
  const balanceDue = Math.max(0, totalNum - paidNum);
  const percentPaid = totalNum > 0 ? Math.min(100, Math.round((paidNum / totalNum) * 100)) : 0;
  const langMeta = getLangMeta(booking.language);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 flex flex-col gap-0 border-s border-border/80 bg-background">
        
        {/* Luxury Header Banner */}
        <SheetHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span title={langMeta.name} className="text-xl shrink-0">{langMeta.flag}</span>
                <SheetTitle className="text-2xl font-bold font-mono dir-ltr inline-block tracking-tight text-primary">
                  {booking.referenceCode}
                </SheetTitle>
                <StatusBadge status={booking.status} />
                {booking.bookingType && booking.bookingType !== "BOOKING" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {booking.bookingType}
                  </span>
                )}
                {isDetailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </div>
              <SheetDescription className="mt-1 text-sm font-medium text-foreground">
                {booking.tour?.titleJsonb
                  ? (typeof booking.tour.titleJsonb === 'object' && 'en' in (booking.tour.titleJsonb as any)
                      ? (booking.tour.titleJsonb as any).en
                      : String(booking.tour.titleJsonb))
                  : (booking.tourNameEn || booking.tourSlug || "Tour")}
              </SheetDescription>
            </div>

            <div className="text-end flex flex-col items-end gap-1">
              <div className="text-2xl font-bold font-mono dir-ltr text-foreground">
                {formatAmountSafe(booking.totalAmount, booking.currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                {tCommon("createdAt")}: {formatDateSafe(booking.createdAt, "MMM do, yyyy h:mm a")}
              </div>
              {booking.status === "CANCELLED" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 mt-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 h-7 text-xs"
                  onClick={() => restoreBooking(booking.referenceCode)}
                  disabled={isRestoring}
                >
                  <RefreshCcw className="h-3 w-3" />
                  {tCommon("retry")}
                </Button>
              )}
            </div>
          </div>

          {/* Financial Progress Bar */}
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground gap-4">
            <div className="flex items-center gap-3">
              <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">${paidNum.toFixed(2)}</strong></span>
              <span>•</span>
              <span>Due: <strong className={balanceDue > 0 ? "text-amber-600 dark:text-amber-400 font-mono" : "text-muted-foreground font-mono"}>${balanceDue.toFixed(2)}</strong></span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
              <span className="font-mono text-[11px]">{percentPaid}%</span>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs Navigation */}
        <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col">
          <div className="px-6 pt-2 border-b border-border/60 bg-muted/10">
            <TabsList className="w-full flex h-11 justify-start gap-1 bg-transparent p-0 overflow-x-auto">
              <TabsTrigger value="summary" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tCommon("details")}
              </TabsTrigger>
              <TabsTrigger value="customer" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tBookings("customer")}
              </TabsTrigger>
              <TabsTrigger value="passengers" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tBookings("passengerCount")} ({booking.passengers?.length || booking.passengerCount || 1})
              </TabsTrigger>
              <TabsTrigger value="invoice" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tBookings("paymentDetails")}
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tCommon("description")}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tNav("media")}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg px-3.5 py-1.5 text-xs font-semibold">
                {tCommon("date")}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6 h-[calc(100vh-250px)]">
            
            {/* ── TAB 1: SUMMARY & RESERVATION DETAILS ── */}
            <TabsContent value="summary" className="mt-0 space-y-6">
              
              {/* Tour & Destination Overview */}
              <div className="rounded-xl border border-border/80 p-4 bg-card/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Itinerary & Destination
                  </h4>
                  {booking.tourSlug && (
                    <a
                      href={`/tours/${booking.tourSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live Tour <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Tour Slug</span>
                    <span className="font-mono text-xs font-medium text-foreground">{booking.tourSlug || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Category</span>
                    <span className="font-medium text-foreground">{booking.tour?.category || "Luxury Travel"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Destination</span>
                    <span className="font-medium text-foreground">{[booking.tour?.city, booking.tour?.country].filter(Boolean).join(", ") || "Egypt / Regional"}</span>
                  </div>
                </div>
              </div>

              {/* Travel Schedule & Dates */}
              <div className="rounded-xl border border-border/80 p-4 bg-card/60 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Travel Schedule & Timings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-xs text-muted-foreground block mb-0.5">Arrival Date & Time</span>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{formatDateSafe(booking.arrivalDate)}</span>
                      {booking.arrivalTime && (
                        <span className="text-xs font-mono text-muted-foreground">@ {booking.arrivalTime}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-xs text-muted-foreground block mb-0.5">Departure Date & Time</span>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{formatDateSafe(booking.departureDate)}</span>
                      {booking.departureTime && (
                        <span className="text-xs font-mono text-muted-foreground">@ {booking.departureTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Choice (Special Luxury Feature) */}
              {booking.transportChoice && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span>{booking.transportChoice.toLowerCase().includes("train") ? "🚄" : "🚌"}</span>
                    Selected Transport Method
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-foreground">
                        {booking.transportChoice.toLowerCase().includes("train")
                          ? "High-Speed Luxury Rail (القطار السريع)"
                          : "Panoramic Luxury Coach via Grand Bazaar (حافلة فاخرة)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.transportChoice.toLowerCase().includes("train")
                          ? "Duration: ~4 hours (Istanbul → Ankara)"
                          : "Duration: ~6 hours via Grand Bazaar"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase">
                      Confirmed Choice
                    </span>
                  </div>
                </div>
              )}

              {/* Guest Count & Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/80 p-4 bg-card/60 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Guest Breakdown
                  </h4>
                  <div className="flex items-center gap-4 text-sm pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">👤</span>
                      <div>
                        <span className="font-bold text-foreground">{booking.adults ?? booking.passengerCount ?? 1}</span>
                        <span className="text-xs text-muted-foreground block">Adults</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🧒</span>
                      <div>
                        <span className="font-bold text-foreground">{booking.children ?? 0}</span>
                        <span className="text-xs text-muted-foreground block">Children</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">👶</span>
                      <div>
                        <span className="font-bold text-foreground">{booking.infants ?? 0}</span>
                        <span className="text-xs text-muted-foreground block">Infants</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 p-4 bg-card/60 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Language & Experience
                  </h4>
                  <div className="space-y-1.5 text-sm pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Booking Language</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <span>{langMeta.flag}</span> {langMeta.name}
                      </span>
                    </div>
                    {booking.activityType && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Activity Type</span>
                        <span className="font-medium text-foreground">{booking.activityType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Notes & Inquiry Message */}
              {(booking.notes || booking.inquiryMessage) && (
                <div className="rounded-xl border border-border/80 p-4 bg-muted/20 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-primary" />
                    Special Requests & Client Notes
                  </h4>
                  {typeof booking.notes === 'string' && booking.notes && (
                    <div className="p-3 rounded-lg bg-background border border-border/60 text-sm whitespace-pre-wrap">
                      {booking.notes}
                    </div>
                  )}
                  {booking.inquiryMessage && (
                    <div className="p-3 rounded-lg bg-background border border-border/60 text-sm whitespace-pre-wrap text-muted-foreground">
                      <span className="text-xs font-semibold text-primary block mb-1">Inquiry Message:</span>
                      {booking.inquiryMessage}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── TAB 2: CUSTOMER & BILLING DETAILS ── */}
            <TabsContent value="customer" className="mt-0 space-y-6">
              
              {/* Lead Customer Contact Card */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Lead Traveler & Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Full Passport Name</span>
                    <span className="font-semibold text-base text-foreground">{booking.billingInfo?.fullName || booking.user?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Email Address</span>
                    <span className="font-medium text-foreground dir-ltr inline-block select-all">{booking.billingInfo?.email || booking.user?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Contact Phone</span>
                    <span className="font-medium text-foreground dir-ltr inline-block select-all">{booking.billingInfo?.phone || booking.user?.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Country & City</span>
                    <span className="font-medium text-foreground">{[booking.billingInfo?.city, booking.billingInfo?.country].filter(Boolean).join(", ") || "N/A"}</span>
                  </div>
                </div>

                {booking.billingInfo?.address && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Billing Address</span>
                    <span className="font-medium text-foreground">{booking.billingInfo.address}</span>
                  </div>
                )}
              </div>

              {/* Company & Invoice Type */}
              <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Invoice Classification & Tax Info
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Invoice Type</span>
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-muted text-xs uppercase">
                      {booking.billingInfo?.invoiceType || "PERSONAL"}
                    </span>
                  </div>
                  {booking.billingInfo?.companyName && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-0.5">Company Name</span>
                      <span className="font-medium text-foreground">{booking.billingInfo.companyName}</span>
                    </div>
                  )}
                  {booking.billingInfo?.taxId && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-0.5">Tax ID / VAT</span>
                      <span className="font-mono text-xs font-semibold text-foreground dir-ltr">{booking.billingInfo.taxId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform User Account */}
              {booking.user && (
                <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Registered Account on Platform
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">User ID</span>
                      <span className="font-mono text-xs text-muted-foreground truncate block">{booking.user.id}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Account Role</span>
                      <span className="font-medium text-xs uppercase px-2 py-0.5 rounded bg-primary/10 text-primary w-fit inline-block">
                        {booking.user.role || "USER"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Registered Email</span>
                      <span className="font-medium text-foreground dir-ltr">{booking.user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 3: PASSENGERS ── */}
            <TabsContent value="passengers" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">
                  Registered Travelers: <strong>{booking.passengers?.length || 0}</strong>
                </span>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setPassengerOpen(true)}>
                  {tCommon("edit")}
                </Button>
              </div>

              {booking.passengers && booking.passengers.length > 0 ? (
                <div className="space-y-3">
                  {booking.passengers.map((p, i) => (
                    <div key={p.id || i} className="border rounded-xl p-4 bg-card/60 shadow-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-base text-foreground">{p.fullName}</span>
                        </div>
                        <StatusBadge status={p.passengerType || "ADULT"} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <div>
                          <span className="block text-[10px] text-muted-foreground/70">Passport Number</span>
                          <span className="font-mono font-medium text-foreground dir-ltr">{p.passportNumber || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground/70">Passport Expiry</span>
                          <span className="font-medium text-foreground">{formatDateSafe(p.passportExpiry)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground/70">Nationality</span>
                          <span className="font-medium text-foreground">{p.nationality || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted-foreground/70">Date of Birth</span>
                          <span className="font-medium text-foreground">{formatDateSafe(p.dateOfBirth)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 border border-dashed rounded-xl">
                  {tCommon("noResults")}
                </div>
              )}
            </TabsContent>

            {/* ── TAB 4: INVOICE & PAYMENTS ── */}
            <TabsContent value="invoice" className="mt-0 space-y-6">
              
              {/* Official Invoice Card */}
              {booking.invoice ? (
                <div className="rounded-xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Official Invoice
                      </h4>
                    </div>
                    <StatusBadge status={booking.invoice.status || "ISSUED"} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Invoice Number</span>
                      <span className="font-mono font-semibold text-foreground dir-ltr">#{booking.invoice.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Issue Date</span>
                      <span className="font-medium text-foreground">{formatDateSafe(booking.invoice.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Amount</span>
                      <span className="font-mono font-bold text-foreground dir-ltr">
                        {formatAmountSafe(booking.invoice.total || booking.totalAmount, booking.invoice.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Due Date</span>
                      <span className="font-medium text-foreground">{formatDateSafe(booking.invoice.dueDate)}</span>
                    </div>
                  </div>

                  {booking.invoice.pdfUrl && (
                    <div className="pt-2">
                      <a
                        href={booking.invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Official PDF Invoice
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No official invoice generated yet.
                </div>
              )}

              {/* Payments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    Transaction & Gateway Records ({booking.payments?.length || 0})
                  </h4>
                  {balanceDue > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setPaymentOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 h-8"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> تسجيل دفعة جديدة
                    </Button>
                  )}
                </div>

                {booking.payments && booking.payments.length > 0 ? (
                  booking.payments.map((p: any, i: number) => (
                    <div key={p.id || i} className="border rounded-xl p-4 flex justify-between items-center bg-card/60 shadow-xs">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span>{p.isRefund ? 'Refund' : 'Payment'} via {p.method || 'Credit Card'}</span>
                          <StatusBadge status={p.status || "COMPLETED"} />
                        </div>
                        <div className="text-xs text-muted-foreground dir-ltr text-start mt-0.5">
                          TX ID: <span className="font-mono">{p.transactionId || "N/A"}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {formatDateSafe(p.createdAt, "MMM do, yyyy h:mm a")}
                        </div>
                      </div>
                      <div className={`font-mono text-base font-bold dir-ltr ${p.isRefund ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {p.isRefund ? '-' : '+'}{p.currency || 'USD'} {p.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8 border border-dashed rounded-xl">
                    No transactions recorded yet.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── TAB 5: INTERNAL STAFF NOTES ── */}
            <TabsContent value="notes" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Internal Concierge Notes</span>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setNoteOpen(true)}>
                  <Plus className="w-3.5 h-3.5"/> {tCommon("create")}
                </Button>
              </div>

              {Array.isArray(booking.notesList) && booking.notesList.length > 0 ? (
                booking.notesList.map((n: any, i: number) => (
                  <div key={n.id || i} className="border rounded-xl p-4 flex flex-col gap-2 bg-card/60 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-xs text-foreground">{n.user?.name || "Concierge Staff"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDateSafe(n.createdAt, "MMM do, yyyy h:mm a")}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">{n.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10 border border-dashed rounded-xl">
                  {tCommon("noResults")}
                </div>
              )}
            </TabsContent>

            {/* ── TAB 6: ATTACHMENTS ── */}
            <TabsContent value="attachments" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Uploaded Documents & Vouchers</span>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setAttachmentOpen(true)}>
                  <Paperclip className="w-3.5 h-3.5"/> {tCommon("upload")}
                </Button>
              </div>

              {booking.attachments && booking.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.attachments.map((a: any, i: number) => (
                    <div key={a.id || i} className="border rounded-xl p-3.5 flex flex-col justify-between items-start bg-card/60 shadow-xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 w-full mb-2">
                        <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-medium text-sm truncate w-full" title={a.fileName}>{a.fileName || "Document"}</span>
                      </div>
                      <StatusBadge status={a.documentType || 'DOCUMENT'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 border border-dashed rounded-xl">
                  {tCommon("noResults")}
                </div>
              )}
            </TabsContent>

            {/* ── TAB 7: TIMELINE ── */}
            <TabsContent value="timeline" className="mt-0 space-y-4">
              {booking.activityLogs && booking.activityLogs.length > 0 ? (
                <div className="relative border-s border-border ms-4 space-y-6 pt-2">
                  {booking.activityLogs.map((log: any, i: number) => (
                    <div key={log.id || i} className="relative ps-6">
                      <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -start-[5px] top-1.5 ring-4 ring-background" />
                      <div className="font-semibold text-sm text-foreground">{(log.action || "UPDATE").replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatDateSafe(log.createdAt, "MMM do, yyyy h:mm a")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 border border-dashed rounded-xl">
                  {tCommon("noResults")}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>

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
    </Sheet>
  );
}
