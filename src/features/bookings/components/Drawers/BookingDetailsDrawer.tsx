"use client";

import { Booking } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRestoreBooking } from "../../hooks/useBookings";
import { FileText, RefreshCcw, Paperclip, Plus, CreditCard } from "lucide-react";
import { useState } from "react";
import { AddPaymentDialog } from "../Dialogs/AddPaymentDialog";
import { AddNoteDialog } from "../Dialogs/AddNoteDialog";
import { AddAttachmentDialog } from "../Dialogs/AddAttachmentDialog";
import { EditPassengersDialog } from "../Dialogs/EditPassengersDialog";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

interface BookingDetailsDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDateSafe = (dateStr?: string | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, fmt);
  } catch {
    return "N/A";
  }
};

const formatAmountSafe = (val?: string | number) => {
  const num = typeof val === "number" ? val : parseFloat(val || "0");
  return isNaN(num)
    ? "$0.00"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

export function BookingDetailsDrawer({ booking, open, onOpenChange }: BookingDetailsDrawerProps) {
  const tBookings = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { mutate: restoreBooking, isPending: isRestoring } = useRestoreBooking();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [passengerOpen, setPassengerOpen] = useState(false);

  if (!booking) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[700px] md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                <span className="dir-ltr inline-block">{booking.referenceCode}</span>
                <StatusBadge status={booking.status} />
              </SheetTitle>
              <SheetDescription className="mt-1 text-base">
                {booking.tourNameEn || booking.tourSlug || "Tour"}
              </SheetDescription>
            </div>
            <div className="text-end flex flex-col items-end gap-2">
              <div className="text-2xl font-bold dir-ltr">
                {formatAmountSafe(booking.totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {tCommon("createdAt")}: {formatDateSafe(booking.createdAt)}
              </div>
              {booking.status === "CANCELLED" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 mt-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => restoreBooking(booking.referenceCode)}
                  disabled={isRestoring}
                >
                  <RefreshCcw className="h-3 w-3" />
                  {tCommon("retry")}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full flex h-12 overflow-x-auto">
            <TabsTrigger value="summary">{tCommon("details")}</TabsTrigger>
            <TabsTrigger value="passengers">{tBookings("passengerCount")}</TabsTrigger>
            <TabsTrigger value="payments">{tBookings("paymentDetails")}</TabsTrigger>
            <TabsTrigger value="notes">{tCommon("description")}</TabsTrigger>
            <TabsTrigger value="attachments">{tNav("media")}</TabsTrigger>
            <TabsTrigger value="timeline">{tCommon("date")}</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)] mt-4 pe-4">
            <TabsContent value="summary" className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{tBookings("customerInformation")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">{tCommon("name")}</span>
                    <span className="font-medium">{booking.billingInfo?.fullName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">{tCommon("email")}</span>
                    <span className="font-medium dir-ltr inline-block">{booking.billingInfo?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">{tCommon("phone")}</span>
                    <span className="font-medium dir-ltr inline-block">{booking.billingInfo?.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">{tBookings("customer")}</span>
                    <span className="font-medium">{[booking.billingInfo?.city, booking.billingInfo?.country].filter(Boolean).join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">{tBookings("bookingDetails")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">{tBookings("bookingId")}</span>
                    <span className="font-medium dir-ltr inline-block">{booking.tourId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">{tBookings("travelDate")}</span>
                    <span className="font-medium">
                      {formatDateSafe(booking.arrivalDate)} 
                      {booking.departureDate ? ` - ${formatDateSafe(booking.departureDate)}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">{tBookings("guests")}</span>
                    <span className="font-medium">{booking.passengerCount ?? 0} ({booking.passengers?.length ?? 0})</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="passengers" className="space-y-4">
               <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => setPassengerOpen(true)}>{tCommon("edit")}</Button>
               </div>
              {booking.passengers && booking.passengers.length > 0 ? (
                booking.passengers.map((p, i) => (
                  <div key={p.id || i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{p.fullName}</span>
                      <StatusBadge status={p.passengerType || "ADULT"} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="dir-ltr text-start">Passport: {p.passportNumber || "N/A"}</div>
                      <div>Expiry: {formatDateSafe(p.passportExpiry)}</div>
                      <div>Nationality: {p.nationality || "N/A"}</div>
                      <div>DOB: {formatDateSafe(p.dateOfBirth)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {tCommon("noResults")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
               <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => setPaymentOpen(true)}><CreditCard className="w-4 h-4"/> {tBookings("paymentDetails")}</Button>
               </div>
               {booking.payments && booking.payments.length > 0 ? (
                booking.payments.map((p: any, i: number) => (
                  <div key={p.id || i} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.isRefund ? 'Refund' : 'Payment'} via {p.method || 'Card'}</div>
                      <div className="text-sm text-muted-foreground dir-ltr text-start">{p.transactionId || "No TX ID"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{formatDateSafe(p.createdAt, "MMM do, yyyy h:mm a")}</div>
                    </div>
                    <div className={`font-bold dir-ltr ${p.isRefund ? 'text-red-500' : 'text-green-600'}`}>
                      {p.isRefund ? '-' : '+'}{p.currency || 'USD'} {p.amount}
                    </div>
                  </div>
                ))
               ) : (
                <div className="text-center text-muted-foreground py-8">
                  {tCommon("noResults")}
                </div>
               )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
               <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => setNoteOpen(true)}><Plus className="w-4 h-4"/> {tCommon("create")}</Button>
               </div>
               {booking.notes && booking.notes.length > 0 ? (
                booking.notes.map((n: any, i: number) => (
                  <div key={n.id || i} className="border rounded-lg p-4 flex flex-col gap-2 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Note</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDateSafe(n.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))
               ) : (
                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                  {tCommon("noResults")}
                </div>
               )}
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
               <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => setAttachmentOpen(true)}><Paperclip className="w-4 h-4"/> {tCommon("upload")}</Button>
               </div>
               {booking.attachments && booking.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {booking.attachments.map((a: any, i: number) => (
                    <div key={a.id || i} className="border rounded-lg p-3 flex flex-col justify-between items-start h-24 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm truncate w-full" title={a.fileName}>{a.fileName}</span>
                      </div>
                      <StatusBadge status={a.documentType || 'DOCUMENT'} />
                    </div>
                  ))}
                </div>
               ) : (
                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                  {tCommon("noResults")}
                </div>
               )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
               {booking.activityLogs && booking.activityLogs.length > 0 ? (
                 <div className="relative border-s border-muted ms-3 space-y-6">
                   {booking.activityLogs.map((log: any, i: number) => (
                     <div key={log.id || i} className="relative ps-6">
                       <div className="absolute w-3 h-3 bg-primary rounded-full -start-[6.5px] top-1.5" />
                       <div className="font-medium">{(log.action || "UPDATE").replace(/_/g, ' ')}</div>
                       <div className="text-sm text-muted-foreground mt-0.5">{formatDateSafe(log.createdAt, "MMM do, yyyy h:mm a")}</div>
                     </div>
                   ))}
                 </div>
               ) : (
                <div className="text-center text-muted-foreground py-8">
                  {tCommon("noResults")}
                </div>
               )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      <AddPaymentDialog 
        referenceCode={booking.referenceCode} 
        open={paymentOpen} 
        onOpenChange={setPaymentOpen} 
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
      <EditPassengersDialog
        referenceCode={booking.referenceCode}
        initialPassengers={booking.passengers || []}
        open={passengerOpen}
        onOpenChange={setPassengerOpen}
      />
    </Sheet>
  );
}
