"use client";

import { useState } from "react";
import { Customer } from "../../types";
import { 
  useCustomerDetail, 
  useUpdateCustomerCrm, 
  useAddCustomerNote, 
  useAddCustomerDocument 
} from "../../hooks/useCustomers";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, FileText, Plus, ExternalLink, Calendar, Shield, MapPin, DollarSign, Activity, Bell, Loader2 } from "lucide-react";
import { BookingDetailsDrawer } from "@/features/bookings/components/Drawers/BookingDetailsDrawer";
import { Booking } from "@/features/bookings/types";
import { AiCustomerInsightsTab } from "@/features/ai/components/AiCustomerInsightsTab";

interface CustomerProfileDrawerProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerProfileDrawer({ customer, open, onOpenChange }: CustomerProfileDrawerProps) {
  const { data: detail, isLoading } = useCustomerDetail(customer?.id || "");
  const updateCrm = useUpdateCustomerCrm();
  const addNote = useAddCustomerNote();
  const addDocument = useAddCustomerDocument();

  // Booking drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState("INTERNAL");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Document form state
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("PASSPORT");
  const [mediaAssetId, setMediaAssetId] = useState("");
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  if (!customer) return null;

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsAddingNote(true);
    try {
      await addNote.mutateAsync({
        id: customer.id,
        data: { content: newNoteContent, noteType: newNoteType, isPinned: false },
      });
      setNewNoteContent("");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddDocument = async () => {
    if (!docTitle.trim() || !mediaAssetId.trim()) return;
    setIsAddingDoc(true);
    try {
      await addDocument.mutateAsync({
        id: customer.id,
        data: { title: docTitle, documentType: docType, mediaAssetId },
      });
      setDocTitle("");
      setMediaAssetId("");
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleToggleVip = async () => {
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { isVip: !detail?.isVip },
    });
  };

  const handleUpdatePreference = async (key: string, value: any) => {
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { [key]: value },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[750px] lg:w-[900px] max-w-4xl overflow-y-auto pr-2 pl-6">
        {isLoading || !detail ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SheetHeader className="mb-6 pr-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {detail.name}
                    </SheetTitle>
                    {detail.isVip && (
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 flex items-center shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-current" /> VIP
                      </Badge>
                    )}
                    <Badge variant={detail.status === "ACTIVE" ? "default" : "secondary"}>
                      {detail.status}
                    </Badge>
                  </div>
                  <SheetDescription className="text-base text-gray-500 flex items-center gap-3">
                    <span>{detail.email}</span>
                    {detail.phone && (
                      <>
                        <span>•</span>
                        <span>{detail.phone}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-mono text-xs text-primary">{detail.customerNumber}</span>
                  </SheetDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(detail.totalSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lifetime Spent ({detail.bookings?.length || 0} Bookings)
                  </div>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-8 h-11 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
                <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs font-medium">Bookings</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs font-medium">Payments</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs font-medium">Notes ({detail.notes?.length || 0})</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs font-medium">Docs ({detail.documents?.length || 0})</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs font-medium">Timeline</TabsTrigger>
                <TabsTrigger value="future" className="text-xs font-medium">Marketing</TabsTrigger>
                <TabsTrigger value="ai-insights" className="text-xs font-medium text-indigo-600 dark:text-indigo-400">AI ✨</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-220px)] pr-6">
                {/* 1. OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                  {/* VIP & Key Actions */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        VIP Concierge Status
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {detail.isVip ? "Customer is enrolled in the VIP luxury tier." : "Customer is currently in the standard tier."}
                      </p>
                    </div>
                    <Button variant={detail.isVip ? "outline" : "default"} size="sm" onClick={handleToggleVip}>
                      {detail.isVip ? "Demote from VIP" : "Upgrade to VIP"}
                    </Button>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> Personal & Identification
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Passport Number</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.passportNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Nationality</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.nationality || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Date of Birth</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.dateOfBirth ? format(new Date(detail.dateOfBirth), "MMM do, yyyy") : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Gender</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.gender || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Phone Verified</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.phoneVerified ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Registered</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(detail.createdAt), "MMM do, yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Preferences */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Travel Preferences
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Preferred Destination</span>
                        <Input 
                          placeholder="e.g. Red Sea / Luxor" 
                          defaultValue={detail.preferredDestination || ""}
                          onBlur={(e) => handleUpdatePreference("preferredDestination", e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Preferred Travel Type</span>
                        <Input 
                          placeholder="e.g. Private Luxury Charter" 
                          defaultValue={detail.preferredTravelType || ""}
                          onBlur={(e) => handleUpdatePreference("preferredTravelType", e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Language / Currency</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.preferredLanguage?.toUpperCase() || "EN"} / {detail.preferredCurrency || "USD"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Favorite Tour</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.favoriteTour || "None"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Emergency & Contacts */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Emergency Contact & Address</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Emergency Contact</span>
                        {detail.emergencyContact ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{detail.emergencyContact.name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{detail.emergencyContact.relationship || "Relationship"} • {detail.emergencyContact.phone || "No Phone"}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No emergency contact specified.</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Address</span>
                        {detail.address ? (
                          <div className="text-xs text-gray-900 dark:text-gray-100 space-y-0.5">
                            <div>{detail.address.street}</div>
                            <div>{[detail.address.city, detail.address.state, detail.address.country].filter(Boolean).join(", ")}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No address specified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. BOOKINGS TAB */}
                <TabsContent value="bookings" className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Booking History ({detail.bookings?.length || 0})</h3>
                    <div className="text-xs text-muted-foreground">Avg. Spend: ${detail.averageSpend}</div>
                  </div>

                  {detail.bookings && detail.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {detail.bookings.map((b) => (
                        <div 
                          key={b.id} 
                          className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/40 transition cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsBookingDrawerOpen(true);
                          }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold font-mono text-primary">{b.referenceCode}</span>
                              <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "secondary" : "destructive"} className="text-[10px]">
                                {b.status}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {(b as any).tourNameEn || b.tourId}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Created {format(new Date(b.createdAt), "MMM do, yyyy")}</span>
                              <span>•</span>
                              <span>{b.passengerCount} Travelers</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat((b as any).totalAmountUsd || (b as any).totalAmount || "0"))}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                              <span>View Details</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                      No bookings recorded for this customer yet.
                    </div>
                  )}
                </TabsContent>

                {/* 3. PAYMENTS TAB */}
                <TabsContent value="payments" className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Total Billed</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">${detail.totalSpent}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Total Paid</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">${detail.totalPaid}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Outstanding Balance</span>
                      <span className={`text-lg font-bold ${detail.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                        ${detail.outstandingBalance}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Detailed Payment Ledger</h3>
                    <div className="space-y-3">
                      {detail.bookings?.flatMap(b => b.payments || []).length > 0 ? (
                        detail.bookings.flatMap(b => b.payments || []).map((p: any, i: number) => (
                          <div key={p.id || i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span>{p.isRefund ? 'Refund' : 'Payment'} via {p.method}</span>
                                <Badge variant="outline" className="text-[10px] uppercase">{p.currency || 'USD'}</Badge>
                              </div>
                              <div className="text-xs font-mono text-muted-foreground">{p.transactionId || "No Transaction ID"}</div>
                              <div className="text-xs text-muted-foreground">{format(new Date(p.createdAt), "MMM do, yyyy h:mm a")}</div>
                            </div>
                            <div className={`text-base font-bold ${p.isRefund ? 'text-red-500' : 'text-green-600'}`}>
                              {p.isRefund ? '-' : '+'}{p.currency || 'USD'} {p.amount}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                          No payments recorded in the ledger.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* 4. NOTES TAB */}
                <TabsContent value="notes" className="space-y-6">
                  {/* Add Note Form */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Add Customer Note</h4>
                      <Select defaultValue={newNoteType} onValueChange={(val) => val && setNewNoteType(val)}>
                        <SelectTrigger className="w-36 h-8 text-xs bg-white dark:bg-gray-800">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTERNAL">Internal Note</SelectItem>
                          <SelectItem value="SALES">Sales Note</SelectItem>
                          <SelectItem value="OPERATIONS">Operations Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea 
                      placeholder="Type notes regarding custom requests, sales discussions, or support interactions..." 
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="text-xs bg-white dark:bg-gray-800 resize-none h-20"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddNote} disabled={isAddingNote || !newNoteContent.trim()} className="h-8 text-xs flex items-center gap-1.5">
                        {isAddingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        <span>Save Note</span>
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {detail.notes && detail.notes.length > 0 ? (
                      detail.notes.map((n) => (
                        <div key={n.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] font-medium">{n.noteType}</Badge>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{n.authorName}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{format(new Date(n.createdAt), "MMM do, yyyy h:mm a")}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {n.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No internal notes added for this customer yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 5. DOCUMENTS TAB */}
                <TabsContent value="documents" className="space-y-6">
                  {/* Add Document Form */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Attach Document</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Document Title</span>
                        <Input 
                          placeholder="e.g. Passport Scan 2026" 
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Document Type</span>
                        <Select defaultValue={docType} onValueChange={(val) => val && setDocType(val)}>
                          <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PASSPORT">Passport Scan</SelectItem>
                            <SelectItem value="VISA">Visa Document</SelectItem>
                            <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                            <SelectItem value="INSURANCE">Travel Insurance</SelectItem>
                            <SelectItem value="TICKET">Flight Ticket</SelectItem>
                            <SelectItem value="INVOICE">External Invoice</SelectItem>
                            <SelectItem value="OTHER">Other Document</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground block mb-1">Media Asset ID (From Media Module)</span>
                        <Input 
                          placeholder="e.g. uuid-media-file-1" 
                          value={mediaAssetId}
                          onChange={(e) => setMediaAssetId(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-gray-800 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddDocument} disabled={isAddingDoc || !docTitle.trim() || !mediaAssetId.trim()} className="h-8 text-xs flex items-center gap-1.5">
                        {isAddingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        <span>Attach Document</span>
                      </Button>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {detail.documents && detail.documents.length > 0 ? (
                      detail.documents.map((d) => (
                        <div key={d.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{d.title}</span>
                                <Badge variant="outline" className="text-[10px]">{d.documentType}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Attached {format(new Date(d.createdAt), "MMM do, yyyy")} • Asset ID: <span className="font-mono">{d.mediaAssetId}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1" onClick={() => window.open(`/api/media/${d.mediaAssetId}`, '_blank')}>
                            <span>View File</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No documents attached to this customer profile yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 6. TIMELINE TAB */}
                <TabsContent value="timeline" className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Action Timeline</h3>
                  {detail.timeline && detail.timeline.length > 0 ? (
                    <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-6 py-2">
                      {detail.timeline.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-white dark:ring-gray-900" />
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{log.action.replace(/_/g, ' ')}</div>
                            <span className="text-[11px] text-muted-foreground">{format(new Date(log.createdAt), "MMM do, yyyy h:mm a")}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">Performed by {log.authorName}</div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="text-xs mt-2 p-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg font-mono text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 overflow-x-auto">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                      No activity events recorded yet.
                    </div>
                  )}
                </TabsContent>

                {/* 7. FUTURE RELATIONS & MARKETING TAB */}
                <TabsContent value="future" className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Marketing & Referral Attribution</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Marketing Consent</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={detail.marketingConsent ? "default" : "secondary"}>
                            {detail.marketingConsent ? "Subscribed" : "Opted Out"}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleUpdatePreference("marketingConsent", !detail.marketingConsent)}>
                            Toggle
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Customer Source</span>
                        <Input 
                          placeholder="e.g. WEB / REFERRAL / AGENT" 
                          defaultValue={detail.customerSource || "WEB"}
                          onBlur={(e) => handleUpdatePreference("customerSource", e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs mb-1">Referral Attribution Source</span>
                        <Input 
                          placeholder="e.g. VIP Concierge Referral Program 2026" 
                          defaultValue={detail.referralSource || ""}
                          onBlur={(e) => handleUpdatePreference("referralSource", e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Future System Relations (Phases 6, 7 & 8)</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">Future Company Relation (B2B Agency)</span>
                          <Badge variant="outline" className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">Phase 6 Ready</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Linked company or corporate partner managing this traveler.</p>
                        <Input 
                          placeholder="Link Company UUID..." 
                          defaultValue={detail.futureCompanyId || ""}
                          onBlur={(e) => handleUpdatePreference("futureCompanyId", e.target.value)}
                          className="h-8 text-xs mt-2 font-mono"
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">Future Wallet Relation (Loyalty & Credits)</span>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Phase 7 Ready</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Stored digital wallet account for refunds, commissions, and travel credit.</p>
                        <Input 
                          placeholder="Link Wallet UUID..." 
                          defaultValue={detail.futureWalletId || ""}
                          onBlur={(e) => handleUpdatePreference("futureWalletId", e.target.value)}
                          className="h-8 text-xs mt-2 font-mono"
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">Future Commission Plan</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">Phase 8 Ready</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Assigned commission structure for agent referrals.</p>
                        <Input 
                          placeholder="Link Commission Tier..." 
                          defaultValue={detail.futureCommissionPlan || ""}
                          onBlur={(e) => handleUpdatePreference("futureCommissionPlan", e.target.value)}
                          className="h-8 text-xs mt-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 8. AI INSIGHTS TAB */}
                <TabsContent value="ai-insights" className="space-y-6">
                  <AiCustomerInsightsTab customerId={detail.id} customerName={detail.name} />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Nested Booking Details Drawer */}
            <BookingDetailsDrawer 
              booking={selectedBooking} 
              open={isBookingDrawerOpen} 
              onOpenChange={setIsBookingDrawerOpen} 
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
