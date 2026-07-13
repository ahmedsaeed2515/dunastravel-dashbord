"use client";

import { Booking } from "../../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRestoreBooking, useAddPayment, useAddNote, useAddAttachment } from "../../hooks/useBookings";
import { FileText, RefreshCcw, Paperclip, Plus, CreditCard } from "lucide-react";

interface BookingDetailsDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailsDrawer({ booking, open, onOpenChange }: BookingDetailsDrawerProps) {
  const { mutate: restoreBooking, isPending: isRestoring } = useRestoreBooking();

  if (!booking) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[700px] md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                {booking.referenceCode}
                <Badge variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "secondary" : "destructive"}>
                  {booking.status}
                </Badge>
              </SheetTitle>
              <SheetDescription className="mt-1 text-base">
                {booking.tourNameEn}
              </SheetDescription>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(booking.totalAmount))}
              </div>
              <div className="text-sm text-muted-foreground">
                Created {format(new Date(booking.createdAt), "MMM do, yyyy")}
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
                  Restore Booking
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full flex h-12 overflow-x-auto">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="passengers">Passengers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="attachments">Files</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
            <TabsContent value="summary" className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Full Name</span>
                    <span className="font-medium">{booking.billingInfo?.fullName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Email</span>
                    <span className="font-medium">{booking.billingInfo?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Phone</span>
                    <span className="font-medium">{booking.billingInfo?.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <span className="font-medium">{[booking.billingInfo?.city, booking.billingInfo?.country].filter(Boolean).join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Trip Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Tour ID</span>
                    <span className="font-medium">{booking.tourId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Dates</span>
                    <span className="font-medium">
                      {booking.arrivalDate && format(new Date(booking.arrivalDate), "MMM do, yyyy")} 
                      {booking.departureDate && ` - ${format(new Date(booking.departureDate), "MMM do, yyyy")}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Travelers</span>
                    <span className="font-medium">{booking.passengerCount} Total ({booking.passengers?.length || 0} Listed)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Invoice</span>
                    <span className="font-medium">{booking.invoiceNumber || "Uninvoiced"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Enterprise Metadata</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Assignee ID</span>
                    <span className="font-medium">{booking.assigneeId || "Unassigned"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Priority</span>
                    <Badge variant="outline">{booking.priority || "NORMAL"}</Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block mb-1">Tags</span>
                    <div className="flex gap-2 flex-wrap">
                      {booking.tags?.length ? (
                        booking.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                      ) : (
                        <span className="text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="passengers" className="space-y-4">
              {booking.passengers && booking.passengers.length > 0 ? (
                booking.passengers.map((p, i) => (
                  <div key={p.id || i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{p.fullName}</span>
                      <Badge variant="outline">{p.passengerType.toUpperCase()}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Passport: {p.passportNumber || "N/A"}</div>
                      <div>Expiry: {p.passportExpiry ? format(new Date(p.passportExpiry), "MMM do, yyyy") : "N/A"}</div>
                      <div>Nationality: {p.nationality || "N/A"}</div>
                      <div>DOB: {p.dateOfBirth ? format(new Date(p.dateOfBirth), "MMM do, yyyy") : "N/A"}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No passenger details recorded yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
               <div className="flex justify-end mb-2">
                 {/* In a real app this opens a modal; here just a disabled button as a placeholder for the wiring */}
                 <Button variant="outline" size="sm" className="gap-2"><CreditCard className="w-4 h-4"/> Add Payment</Button>
               </div>
               {booking.payments && booking.payments.length > 0 ? (
                booking.payments.map((p: any, i: number) => (
                  <div key={p.id || i} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.isRefund ? 'Refund' : 'Payment'} via {p.method}</div>
                      <div className="text-sm text-muted-foreground">{p.transactionId || "No TX ID"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{format(new Date(p.createdAt), "MMM do, yyyy h:mm a")}</div>
                    </div>
                    <div className={`font-bold ${p.isRefund ? 'text-red-500' : 'text-green-600'}`}>
                      {p.isRefund ? '-' : '+'}{p.currency} {p.amount}
                    </div>
                  </div>
                ))
               ) : (
                <div className="text-center text-muted-foreground py-8">
                  No payments recorded.
                </div>
               )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add Note</Button>
               </div>
               {booking.notes && booking.notes.length > 0 ? (
                booking.notes.map((n: any, i: number) => (
                  <div key={n.id || i} className="border rounded-lg p-4 flex flex-col gap-2 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Note by Admin</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(n.createdAt), "MMM do, yyyy")}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))
               ) : (
                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                  No notes recorded.
                </div>
               )}
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <div className="flex justify-end mb-2">
                 <Button variant="outline" size="sm" className="gap-2"><Paperclip className="w-4 h-4"/> Upload File</Button>
               </div>
               {booking.attachments && booking.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {booking.attachments.map((a: any, i: number) => (
                    <div key={a.id || i} className="border rounded-lg p-3 flex flex-col justify-between items-start h-24 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm truncate w-full" title={a.fileName}>{a.fileName}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{a.documentType || 'DOCUMENT'}</Badge>
                    </div>
                  ))}
                </div>
               ) : (
                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                  No attachments found.
                </div>
               )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
               {booking.activityLogs && booking.activityLogs.length > 0 ? (
                 <div className="relative border-l border-muted ml-3 space-y-6">
                   {booking.activityLogs.map((log: any, i: number) => (
                     <div key={log.id || i} className="relative pl-6">
                       <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5" />
                       <div className="font-medium">{log.action.replace(/_/g, ' ')}</div>
                       <div className="text-sm text-muted-foreground mt-0.5">{format(new Date(log.createdAt), "MMM do, yyyy h:mm a")}</div>
                       <div className="text-sm mt-2 p-2 bg-muted rounded-md font-mono text-xs overflow-x-auto max-w-[320px] sm:max-w-full">
                         {JSON.stringify(log.details)}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                <div className="text-center text-muted-foreground py-8">
                  No activity logs recorded.
                </div>
               )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
