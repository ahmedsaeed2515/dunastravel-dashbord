"use client";

import { useState } from "react";
import { Customer, CustomerDetail } from "../../types";
import {
  useCustomerDetail,
  useUpdateCustomerCrm,
  useAddCustomerNote,
  useAddCustomerDocument,
} from "../../hooks/useCustomers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Star,
  FileText,
  Plus,
  ExternalLink,
  Calendar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  DollarSign,
  Activity,
  Bell,
  Loader2,
  Crown,
  Edit,
  Mail,
  Phone,
  Globe,
  Compass,
  Plane,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Tag,
  Layers,
} from "lucide-react";
import { BookingDetailsDrawer } from "@/features/bookings/components/Drawers/BookingDetailsDrawer";
import { Booking } from "@/features/bookings/types";
import { AiCustomerInsightsTab } from "@/features/ai/components/AiCustomerInsightsTab";
import { EditCustomerDialog } from "../EditCustomerDialog";
import { useTranslations } from "next-intl";

interface CustomerProfileModalProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdated?: () => void;
}

const formatDateSafe = (dateStr?: string | null, fmt = "yyyy-MM-dd") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
};

export function CustomerProfileModal({
  customer,
  open,
  onOpenChange,
  onCustomerUpdated,
}: CustomerProfileModalProps) {
  const tCustomers = useTranslations("customers");
  const tCommon = useTranslations("common");

  const customerId = customer?.id || "";
  const { data: detail, isLoading, refetch } = useCustomerDetail(open && customerId ? customerId : "");
  const updateCrm = useUpdateCustomerCrm();
  const addNote = useAddCustomerNote();
  const addDocument = useAddCustomerDocument();

  // Booking drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState("INTERNAL");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Document form state
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("PASSPORT");
  const [mediaAssetId, setMediaAssetId] = useState("");
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("overview");

  if (!customer) return null;

  const currentCustomer: CustomerDetail | Customer = detail || customer;

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsAddingNote(true);
    try {
      await addNote.mutateAsync({
        id: customer.id,
        data: { content: newNoteContent, noteType: newNoteType, isPinned: false },
      });
      setNewNoteContent("");
      refetch();
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
      refetch();
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleToggleVip = async () => {
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { isVip: !currentCustomer.isVip },
    });
    refetch();
    if (onCustomerUpdated) onCustomerUpdated();
  };

  const handleToggleStatus = async () => {
    const nextStatus = currentCustomer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateCrm.mutateAsync({
      id: customer.id,
      data: { status: nextStatus },
    });
    refetch();
    if (onCustomerUpdated) onCustomerUpdated();
  };

  const bookingsList = detail?.bookings || [];
  const notesList = detail?.notes || [];
  const documentsList = detail?.documents || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl sm:max-w-5xl h-[90vh] max-h-[860px] p-0 overflow-hidden flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl">
          {/* ──────── TOP LUXURY HEADER ──────── */}
          <DialogHeader className="p-5 sm:p-6 border-b border-border/70 pb-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 font-extrabold text-2xl shrink-0 shadow-xs">
                  {currentCustomer.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                      {currentCustomer.name}
                    </DialogTitle>
                    {currentCustomer.isVip && (
                      <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-500 bg-amber-500/10 font-bold text-xs">
                        <Crown className="h-3 w-3" /> VIP Concierge
                      </Badge>
                    )}
                    <Badge
                      variant={currentCustomer.status === "ACTIVE" ? "outline" : "destructive"}
                      className={
                        currentCustomer.status === "ACTIVE"
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-xs"
                          : "font-bold text-xs"
                      }
                    >
                      {currentCustomer.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      #{currentCustomer.customerNumber || currentCustomer.id.slice(0, 8)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {currentCustomer.email}
                    </span>
                    {currentCustomer.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono dir-ltr">
                          <Phone className="h-3.5 w-3.5" />
                          {currentCustomer.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleStatus}
                  className={`rounded-xl font-bold text-xs gap-1.5 h-9 ${
                    currentCustomer.status === "ACTIVE"
                      ? "text-red-600 dark:text-red-400 hover:bg-red-500/10 border-red-500/30"
                      : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  {currentCustomer.status === "ACTIVE" ? (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      <span>تعطيل الحساب</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>تفعيل الحساب</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleVip}
                  className="rounded-xl font-bold text-xs gap-1.5 h-9"
                >
                  <Star className={`h-4 w-4 ${currentCustomer.isVip ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  <span>{currentCustomer.isVip ? "إلغاء VIP" : "ترقية إلى VIP"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="rounded-xl font-bold text-xs gap-1.5 h-9"
                >
                  <Edit className="h-4 w-4" />
                  <span>تعديل البيانات</span>
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-border/60">
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">إجمالي الإنفاق (LTV)</div>
                <div className="text-base font-black font-mono text-amber-500">
                  ${(detail?.totalSpent ?? (customer as any).totalSpent ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">الحجوزات المكتملة</div>
                <div className="text-base font-black font-mono">
                  {detail?.bookings?.length ?? customer.bookingsCount ?? 0}
                </div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">الرصيد المستحق</div>
                <div className={`text-base font-black font-mono ${(detail?.outstandingBalance ?? (customer as any).outstandingBalance ?? 0) > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                  ${(detail?.outstandingBalance ?? (customer as any).outstandingBalance ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-card/80 rounded-xl border border-border/60 space-y-0.5">
                <div className="text-[11px] font-semibold text-muted-foreground">تاريخ التسجيل</div>
                <div className="text-xs font-mono font-bold text-muted-foreground pt-1">
                  {formatDateSafe(currentCustomer.createdAt)}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* ──────── TABS NAVIGATION & CONTENT ──────── */}
          <div className="flex-1 overflow-hidden flex flex-col p-5 sm:p-6 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-5 h-10 p-1 bg-muted/60 rounded-xl shrink-0">
                <TabsTrigger value="overview" className="text-xs font-bold gap-1.5 rounded-lg">
                  <FileText className="h-3.5 w-3.5" />
                  <span>الملف والتفضيلات</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Plane className="h-3.5 w-3.5 text-amber-500" />
                  <span>الحجوزات ({bookingsList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Bell className="h-3.5 w-3.5" />
                  <span>الملاحظات ({notesList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>المستندات ({documentsList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs font-bold gap-1.5 rounded-lg">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span>ذكاء السفر AI</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: OVERVIEW & PROFILE */}
              <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 pt-3 pe-1">
                {isLoading ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal & Identity Card */}
                    <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                      <div className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span>بيانات الهوية والإقامة</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">رقم جواز السفر</span>
                          <span className="font-mono font-bold">{detail?.passportNumber || "غير متوفر"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">الجنسية</span>
                          <span className="font-bold">{detail?.nationality || "غير محددة"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">تاريخ الميلاد</span>
                          <span className="font-mono">{formatDateSafe(detail?.dateOfBirth)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">النوع</span>
                          <span className="font-bold">{detail?.gender || "غير محدد"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[11px]">العنوان</span>
                          <span className="font-medium">
                            {detail?.address?.street ? `${detail.address.street}, ${detail.address.city || ""}, ${detail.address.country || ""}` : "غير مسجل"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[11px]">جهة الطوارئ</span>
                          <span className="font-medium">
                            {detail?.emergencyContact?.name ? `${detail.emergencyContact.name} (${detail.emergencyContact.relationship || ""}) - ${detail.emergencyContact.phone || ""}` : "غير مسجلة"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Travel Preferences Card */}
                    <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                      <div className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                        <Compass className="h-4 w-4 text-amber-500" />
                        <span>تفضيلات السفر والرحلات</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">الوجهة المفضلة</span>
                          <span className="font-bold">{detail?.preferredDestination || "الأقصر وأسوان"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">نوع الرحلة المفضل</span>
                          <span className="font-bold">{detail?.preferredTravelType || "رحلات نيلية فاخرة"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">اللغة والعملة</span>
                          <span className="font-mono font-bold uppercase">{detail?.preferredLanguage || "en"} / {detail?.preferredCurrency || "USD"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">مصدر العميل</span>
                          <span className="font-bold">{detail?.customerSource || "مباشر"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[11px]">الوسوم والتصنيفات</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(detail?.tags || customer.tags || []).length > 0 ? (
                              (detail?.tags || customer.tags).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] bg-card">
                                  #{tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-[11px]">لا توجد وسوم</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: BOOKINGS LIST */}
              <TabsContent value="bookings" className="flex-1 overflow-y-auto space-y-3 pt-3 pe-1">
                {bookingsList.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Plane className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="text-sm font-semibold">لا توجد حجوزات مسجلة لهذا العميل</p>
                    <p className="text-xs text-muted-foreground">ستظهر جميع الحجوزات المؤكدة والملغاة هنا فور إنشائها.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 rounded-2xl border border-border/70 overflow-hidden bg-card">
                    {bookingsList.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-foreground">
                              #{booking.referenceCode || booking.id.slice(0, 8)}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDateSafe(booking.arrivalDate || booking.createdAt)}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-amber-500">
                              ${booking.totalAmountUsd || booking.totalPrice || 0}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsBookingDrawerOpen(true);
                          }}
                          className="rounded-xl text-xs font-bold gap-1 self-end sm:self-center"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>تفاصيل الحجز</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: NOTES */}
              <TabsContent value="notes" className="flex-1 overflow-y-auto space-y-4 pt-3 pe-1">
                {/* Add Note Form */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-amber-500" />
                    <span>إضافة ملاحظة إدارية جديدة</span>
                  </div>
                  <Textarea
                    placeholder="اكتب تفاصيل الملاحظة حول العميل أو الاتصال الأخير..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[80px] rounded-xl text-xs bg-card"
                  />
                  <div className="flex items-center justify-between">
                    <Select value={newNoteType} onValueChange={setNewNoteType}>
                      <SelectTrigger className="w-40 h-8 rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTERNAL">ملاحظة داخلية</SelectItem>
                        <SelectItem value="SALES">مبيعات ومتابعة</SelectItem>
                        <SelectItem value="OPERATIONS">تشغيل ورحلات</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNoteContent.trim()}
                      variant="gold"
                      className="rounded-xl text-xs font-bold gap-1 h-8"
                    >
                      {isAddingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>إضافة الملاحظة</span>
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {notesList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">لا توجد ملاحظات مسجلة بعد.</p>
                  ) : (
                    notesList.map((note) => (
                      <div key={note.id} className="p-3.5 bg-card border border-border/70 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {note.noteType}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDateSafe(note.createdAt, "yyyy-MM-dd HH:mm")}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* TAB 4: DOCUMENTS */}
              <TabsContent value="documents" className="flex-1 overflow-y-auto space-y-4 pt-3 pe-1">
                {/* Attach Document Form */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-amber-500" />
                    <span>إرفاق مستند جديد</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="عنوان المستند (مثال: صورة جواز السفر)"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="h-9 rounded-xl text-xs"
                    />
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger className="h-9 rounded-xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSPORT">جواز سفر (Passport)</SelectItem>
                        <SelectItem value="VISA">تأشيرة دخول (Visa)</SelectItem>
                        <SelectItem value="TICKET">تذاكر طيران (Ticket)</SelectItem>
                        <SelectItem value="INSURANCE">تأمين سفر (Insurance)</SelectItem>
                        <SelectItem value="OTHER">مستند آخر</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="معرف الوسائط (Media Asset ID)"
                      value={mediaAssetId}
                      onChange={(e) => setMediaAssetId(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddDocument}
                      disabled={isAddingDoc || !docTitle.trim() || !mediaAssetId.trim()}
                      variant="gold"
                      className="rounded-xl text-xs font-bold gap-1 h-8"
                    >
                      {isAddingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
                      <span>حفظ المستند</span>
                    </Button>
                  </div>
                </div>

                {/* Documents List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentsList.length === 0 ? (
                    <p className="text-xs text-muted-foreground col-span-2 text-center py-6">لا توجد مستندات مرفقة لهذا العميل.</p>
                  ) : (
                    documentsList.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-card border border-border/70 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-xs text-foreground truncate">{doc.title}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-mono">{doc.documentType} • {formatDateSafe(doc.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* TAB 5: AI TRAVEL INSIGHTS */}
              <TabsContent value="ai" className="flex-1 overflow-y-auto pt-3 pe-1">
                <AiCustomerInsightsTab customerId={customerId} customerName={currentCustomer.name} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Details Drawer Sub-layer */}
      {selectedBooking && (
        <BookingDetailsDrawer
          booking={selectedBooking}
          open={isBookingDrawerOpen}
          onOpenChange={setIsBookingDrawerOpen}
        />
      )}

      {/* Edit Customer Dialog Sub-layer */}
      <EditCustomerDialog
        customer={detail || customer}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          refetch();
          if (onCustomerUpdated) onCustomerUpdated();
        }}
      />
    </>
  );
}
