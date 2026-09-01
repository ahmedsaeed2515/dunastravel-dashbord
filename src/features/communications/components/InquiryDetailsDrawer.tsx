"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inquiry } from "../types";
import { useUpdateInquiry, useAssignInquiry, useConvertInquiryToBooking } from "../hooks/useCommunications";
import { useUsers } from "@/features/users/hooks/useUsers";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Send,
  MessageCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Ticket,
  Save,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface InquiryDetailsDrawerProps {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InquiryDetailsDrawer({
  inquiry,
  open,
  onOpenChange,
}: InquiryDetailsDrawerProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";

  const updateInquiry = useUpdateInquiry();
  const assignInquiry = useAssignInquiry();
  const convertInquiry = useConvertInquiryToBooking();
  const { data: usersData } = useUsers({ role: "ADMIN", limit: 50 });

  const [status, setStatus] = useState<string>(inquiry?.status || "NEWLY_RECEIVED");
  const [assigneeId, setAssigneeId] = useState<string>(inquiry?.assigneeId || "");
  const [quoteInput, setQuoteInput] = useState<string>(
    inquiry?.quotedAmountUsd ? String(inquiry.quotedAmountUsd) : inquiry?.budgetAmount ? String(inquiry.budgetAmount) : ""
  );
  const [internalNoteInput, setInternalNoteInput] = useState<string>(inquiry?.internalNote || "");
  const [followUpDate, setFollowUpDate] = useState<string>(
    inquiry?.followUpAt ? new Date(inquiry.followUpAt).toISOString().split("T")[0] : ""
  );

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status || "NEWLY_RECEIVED");
      setAssigneeId(inquiry.assigneeId || "");
      setQuoteInput(
        inquiry.quotedAmountUsd ? String(inquiry.quotedAmountUsd) : inquiry.budgetAmount ? String(inquiry.budgetAmount) : ""
      );
      setInternalNoteInput(inquiry.internalNote || "");
      setFollowUpDate(inquiry.followUpAt ? new Date(inquiry.followUpAt).toISOString().split("T")[0] : "");
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await updateInquiry.mutateAsync({
      referenceCode: inquiry.referenceCode,
      data: { status: newStatus },
    });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    await assignInquiry.mutateAsync({
      referenceCode: inquiry.referenceCode,
      assigneeId: newAssigneeId === "UNASSIGNED" ? null : newAssigneeId,
    });
  };

  const handleSaveQuote = async () => {
    const amountNum = parseFloat(quoteInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(isAr ? "يرجى إدخال مبلغ صحيح لعرض السعر" : "Please enter a valid quote amount");
      return;
    }
    await updateInquiry.mutateAsync({
      referenceCode: inquiry.referenceCode,
      data: {
        quotedAmountUsd: amountNum,
        status: inquiry.status === "NEWLY_RECEIVED" || inquiry.status === "IN_PROGRESS" ? "QUOTED" : inquiry.status,
      },
    });
  };

  const handleSaveNotesAndFollowup = async () => {
    await updateInquiry.mutateAsync({
      referenceCode: inquiry.referenceCode,
      data: {
        internalNote: internalNoteInput.trim() || undefined,
        followUpAt: followUpDate || undefined,
      },
    });
  };

  const handleConvertToBooking = async () => {
    const amountNum = quoteInput ? parseFloat(quoteInput) : undefined;
    await convertInquiry.mutateAsync({
      referenceCode: inquiry.referenceCode,
      payload: {
        quotedAmountUsd: amountNum && !isNaN(amountNum) ? amountNum : undefined,
      },
    });
  };

  const name = inquiry.fullName || `${inquiry.firstName || ''} ${inquiry.lastName || ''}`.trim() || 'عميل دوناس';
  const cleanPhone = (inquiry.phone || '').replace(/[^0-9+]/g, '');

  const statusBadgeConfig: Record<string, { label: string; class: string }> = {
    NEW: { label: isAr ? "جديد (New)" : "New", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    NEWLY_RECEIVED: { label: isAr ? "جديد بانتظار المراجعة" : "Newly Received", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    IN_PROGRESS: { label: isAr ? "قيد المتابعة والتحضير" : "In Progress", class: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
    QUOTED: { label: isAr ? "تم تقديم العرض 💰" : "Quote Sent 💰", class: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
    PROPOSAL_SENT: { label: isAr ? "تم تقديم العرض 💰" : "Quote Sent 💰", class: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
    APPROVED: { label: isAr ? "موافقة العميل ✨" : "Client Approved ✨", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    CONVERTED_TO_BOOKING: { label: isAr ? "حجز رسمي مؤكد 🎟️" : "Converted to Booking 🎟️", class: "bg-emerald-600 text-white border-emerald-700" },
    CLOSED: { label: isAr ? "مغلق 🔒" : "Closed 🔒", class: "bg-muted text-muted-foreground border-border" },
  };

  const currentBadge = statusBadgeConfig[inquiry.status || status] || { label: inquiry.status, class: "bg-muted text-muted-foreground border-border" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0 flex flex-col gap-0 bg-background border-s border-border/80">
        
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✈️</span>
                <SheetTitle className="text-2xl font-bold font-mono dir-ltr inline-block tracking-tight text-primary">
                  {inquiry.referenceCode}
                </SheetTitle>
                <Badge className={`text-xs font-bold ${currentBadge.class}`}>
                  {currentBadge.label}
                </Badge>
              </div>
              <SheetDescription className="mt-1 text-sm font-semibold text-foreground">
                {isAr ? "طلب وتخصيص رحلة فاخرة (Tailor-Made Experience)" : "Custom Luxury Experience Request"}
              </SheetDescription>
            </div>

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> {isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
              </a>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6 space-y-6">
          
          {/* Quick Operations Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card/60 border border-border/80 rounded-2xl p-4 shadow-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">{isAr ? "حالة مسار المبيعات (Pipeline Status)" : "Pipeline Status"}</Label>
              <Select value={inquiry.status || status} onValueChange={handleStatusChange}>
                <SelectTrigger className="rounded-xl text-xs font-bold">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="text-xs font-bold">
                  <SelectItem value="NEWLY_RECEIVED">{isAr ? "جديد بانتظار المراجعة (NEWLY_RECEIVED)" : "Newly Received"}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{isAr ? "قيد المتابعة والتحضير (IN_PROGRESS)" : "In Progress"}</SelectItem>
                  <SelectItem value="QUOTED">{isAr ? "تم تقديم عرض السعر 💰 (QUOTED)" : "Quote Sent"}</SelectItem>
                  <SelectItem value="APPROVED">{isAr ? "موافقة العميل على العرض ✨ (APPROVED)" : "Approved"}</SelectItem>
                  <SelectItem value="CONVERTED_TO_BOOKING">{isAr ? "تم التحويل لحجز رسمي 🎟️ (CONVERTED)" : "Converted"}</SelectItem>
                  <SelectItem value="CLOSED">{isAr ? "مغلق 🔒 (CLOSED)" : "Closed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">{isAr ? "المشرف المسؤول المكلّف" : "Assigned Agent"}</Label>
              <Select value={inquiry.assigneeId || assigneeId || "UNASSIGNED"} onValueChange={handleAssigneeChange}>
                <SelectTrigger className="rounded-xl text-xs font-medium">
                  <SelectValue placeholder="اختر المشرف" />
                </SelectTrigger>
                <SelectContent className="text-xs font-medium">
                  <SelectItem value="UNASSIGNED">{isAr ? "غير معيّن (Unassigned)" : "Unassigned"}</SelectItem>
                  {usersData?.data?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quotation & Pricing Engine Panel */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isAr ? "تسعير وتقديم عرض السعر (Quotation Engine)" : "Quotation Engine"}</span>
              </h4>
              {inquiry.quotedAmountUsd ? (
                <Badge className="bg-purple-600 text-white font-mono font-bold text-xs">
                  ${Number(inquiry.quotedAmountUsd).toLocaleString()} USD
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-purple-500/30">
                  {isAr ? "لم يقدم عرض بعد" : "No quote yet"}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  {isAr ? "قيمة عرض السعر النهائي ($ USD)" : "Quote Amount ($ USD)"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                  <Input
                    type="number"
                    placeholder="e.g. 2500"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    className="pl-7 rtl:pl-3 rtl:pr-7 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleSaveQuote}
                  disabled={updateInquiry.isPending}
                  className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl gap-2 cursor-pointer shadow-xs text-xs"
                >
                  {updateInquiry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isAr ? "حفظ وتثبيت العرض 💰" : "Save Quote & Update"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="rounded-2xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span>{isAr ? "بيانات العميل والتواصل (Customer Details)" : "Customer Details"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">{isAr ? "اسم العميل" : "Customer Name"}</span>
                <span className="font-bold text-foreground">{name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                <a href={`mailto:${inquiry.email}`} className="font-medium text-primary hover:underline dir-ltr inline-block">
                  {inquiry.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</span>
                <span className="font-mono font-medium text-foreground dir-ltr inline-block">
                  {inquiry.phone || "—"}
                </span>
              </div>
            </div>

            {inquiry.company && (
              <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">{isAr ? "شريك سياحي (B2B):" : "B2B Partner:"}</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{inquiry.company.name}</span>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 font-bold">
                  {inquiry.company.tier || 'PLATINUM'}
                </Badge>
              </div>
            )}
          </div>

          {/* Trip Preferences */}
          <div className="rounded-2xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{isAr ? "تفضيلات الرحلة المطلوبة (Trip Specifications)" : "Trip Specifications"}</span>
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">{isAr ? "الوجهات المرغوبة (Destinations):" : "Destinations:"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {inquiry.destinations && inquiry.destinations.length > 0 ? (
                    inquiry.destinations.map((d, i) => (
                      <Badge key={i} variant="secondary" className="font-bold text-xs px-2.5 py-1">
                        📍 {d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">{isAr ? "برنامج مخصص عام" : "General Custom Tour"}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isAr ? "تاريخ السفر:" : "Start Date:"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {inquiry.departureDate || inquiry.startDate || (isAr ? "مرن / غير محدد" : "Flexible")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isAr ? "تاريخ العودة:" : "End Date:"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {inquiry.returnDate || (isAr ? "غير محدد" : "Not specified")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isAr ? "عدد المسافرين:" : "Travelers:"}</span>
                  <span className="font-bold text-foreground">
                    {inquiry.adults || inquiry.numberOfTravelers || 1} {isAr ? "بالغ" : "Adults"}
                    {inquiry.children ? ` + ${inquiry.children} ${isAr ? "أطفال" : "Children"}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{isAr ? "الميزانية التقديرية:" : "Budget:"}</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {inquiry.budgetAmount ? `${inquiry.budgetCurrency || 'USD'} ${inquiry.budgetAmount}` : (isAr ? "مرنة / غير محددة" : "Flexible")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="rounded-2xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              <span>{isAr ? "الملاحظات والطلبات الخاصة بالعميل" : "Customer Notes & Requests"}</span>
            </h4>
            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/40 whitespace-pre-wrap">
              {inquiry.notes || inquiry.specialRequests || (isAr ? "لا توجد ملاحظات إضافية مسجلة من العميل." : "No additional customer notes.")}
            </p>
          </div>

          {/* Internal Notes & Follow-up */}
          <div className="rounded-2xl border border-border/80 p-5 bg-card/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{isAr ? "ملاحظات تشغيلية داخلية وموعد المتابعة" : "Internal Notes & Follow-Up"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">{isAr ? "تاريخ المتابعة القادم:" : "Follow-up Date:"}</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-foreground">{isAr ? "ملاحظات سرية لفريق المبيعات:" : "Internal Sales Notes:"}</Label>
                <Textarea
                  rows={3}
                  placeholder={isAr ? "أي تفاصيل خاصة بمفاوضات العميل أو تفضيلات الفنادق..." : "Client negotiation details, preferred hotels, special itinerary..."}
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveNotesAndFollowup}
              disabled={updateInquiry.isPending}
              className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs"
            >
              {updateInquiry.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isAr ? "حفظ الملاحظات وموعد المتابعة" : "Save Notes"}</span>
            </Button>
          </div>

          {/* Conversion to Booking Action Card */}
          <div className="rounded-2xl border border-amber-500/40 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-black text-foreground">
                  {isAr ? "تحويل الاستفسار إلى حجز رسمي مؤكد" : "Convert Inquiry to Official Booking"}
                </h4>
              </div>
            </div>

            {inquiry.bookingId ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "تم تحويل هذا الاستفسار بنجاح إلى حجز رسمي مسجل في النظام." : "This inquiry has been converted to an official booking."}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/${locale}/admin/bookings`);
                  }}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-sm cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? "الانتقال إلى شاشة الحجوزات الرسمية 🎟️" : "View Booking in Bookings Manager"}</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isAr
                    ? "يقوم هذا الإجراء بإنشاء كائن حجز رسمي وفاتورة مالية معتمدة بالقيمة المسجلة، وربطها مباشرة بالعميل والرحلة."
                    : "Creates an official booking and invoice with the quoted amount, linked to the customer."}
                </p>
                <Button
                  type="button"
                  onClick={handleConvertToBooking}
                  disabled={convertInquiry.isPending}
                  className="w-full h-11 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl gap-2 shadow-md cursor-pointer"
                >
                  {convertInquiry.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isAr ? "تحويل الاستفسار إلى حجز رسمي وفاتورة ✨" : "Convert to Official Booking & Invoice ✨"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

