"use client";

import { useState, useEffect } from "react";
import { Booking, BookingStatus, Passenger } from "../../types";
import { 
  useUpdateBooking, 
  useUpdateBookingStatus, 
  useAssignBooking, 
  useUpsertPassengers 
} from "../../hooks/useBookings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Save, CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { RecordPaymentDialog } from "../Dialogs/RecordPaymentDialog";

interface EditBookingDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BOOKING_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['CONFIRMED', 'PENDING'],
  REFUNDED: [],
  PARTIALLY_PAID: ['CONFIRMED', 'CANCELLED'],
  PAID: ['COMPLETED', 'CANCELLED'],
};

const ALL_BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PARTIALLY_PAID',
  'PAID',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
];

export function EditBookingDrawer({ booking, open, onOpenChange }: EditBookingDrawerProps) {
  const updateBooking = useUpdateBooking();
  const updateStatus = useUpdateBookingStatus();
  const assignBooking = useAssignBooking();
  const upsertPassengers = useUpsertPassengers();

  // Local form states
  const [priority, setPriority] = useState<string>("NORMAL");
  const [tagsString, setTagsString] = useState<string>("");
  const [status, setStatus] = useState<BookingStatus>("PENDING");
  const [statusReason, setStatusReason] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const currentStatus = (booking?.status || 'PENDING') as string;
  const validNextStatuses = BOOKING_STATUS_TRANSITIONS[currentStatus] ?? [];
  const selectableStatuses = ALL_BOOKING_STATUSES.filter(
    (s) => s === currentStatus || validNextStatuses.includes(s)
  );
  const isTerminal = validNextStatuses.length === 0;

  useEffect(() => {
     
    if (booking) {
      setPriority(booking.priority || "NORMAL");
      setTagsString(booking.tags?.join(", ") || "");
      setStatus(booking.status || "PENDING");
      setStatusReason("");
      setAssigneeId(booking.assigneeId || "");
      setPassengers(booking.passengers ? JSON.parse(JSON.stringify(booking.passengers)) : []);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSaveGeneral = async () => {
    const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean);
    await updateBooking.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { priority, tags }
    });
  };

  const handleSaveStatus = async () => {
    await updateStatus.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { status, reason: statusReason || undefined }
    });
  };

  const handleSaveAssignee = async () => {
    await assignBooking.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { assigneeId: assigneeId.trim() || null }
    });
  };

  const handleSavePassengers = async () => {
    // Basic validation
    if (passengers.some(p => !p.fullName.trim())) {
      toast.error("All passengers must have a full name");
      return;
    }
    await upsertPassengers.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { passengers }
    });
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        fullName: "",
        passengerType: "ADULT",
        passportNumber: "",
        passportExpiry: "",
        dateOfBirth: "",
        nationality: ""
      }
    ]);
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const removePassenger = (index: number) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[700px] md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            Edit Booking {booking.referenceCode}
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs">
            تعديل بيانات الحجز وسجلات المسافرين وتعيين الفريق المسؤول.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-11 font-bold rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="general" className="text-xs font-bold">عام</TabsTrigger>
            <TabsTrigger value="status" className="text-xs font-bold">الحالة</TabsTrigger>
            <TabsTrigger value="assignee" className="text-xs font-bold">المسؤول</TabsTrigger>
            <TabsTrigger value="passengers" className="text-xs font-bold">المسافرون</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">درجة الأولوية</Label>
                  <Select onValueChange={(val) => val && setPriority(val)} defaultValue={priority}>
                    <SelectTrigger className="w-full rounded-xl font-bold text-xs">
                      <SelectValue placeholder="اختر مستوى الأولوية" />
                    </SelectTrigger>
                    <SelectContent className="font-bold text-xs">
                      <SelectItem value="LOW">منخفضة (Low)</SelectItem>
                      <SelectItem value="NORMAL">عادية (Normal)</SelectItem>
                      <SelectItem value="HIGH">عالية (High)</SelectItem>
                      <SelectItem value="URGENT">عاجلة جداً (Urgent ⚡)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">الوسوم والتصنيفات (مفصولة بفواصل)</Label>
                  <Input 
                    placeholder="مثال: VIP, شهر عسل, طيران خاص" 
                    value={tagsString} 
                    onChange={(e) => setTagsString(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>

                <Button 
                  onClick={handleSaveGeneral} 
                  disabled={updateBooking.isPending}
                  className="w-full mt-4"
                >
                  {updateBooking.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save General Details
                </Button>
              </div>
            </TabsContent>

            {/* STATUS TAB */}
            <TabsContent value="status" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">حالة الحجز</Label>
                  <Select value={status} onValueChange={(val) => val && setStatus(val as BookingStatus)} disabled={isTerminal}>
                    <SelectTrigger className="w-full font-bold text-xs rounded-xl">
                      <SelectValue placeholder="اختر حالة الحجز" />
                    </SelectTrigger>
                    <SelectContent className="font-bold text-xs">
                      {selectableStatuses.map((s) => (
                        <SelectItem key={s} value={s} disabled={s === currentStatus}>
                          {s === "PENDING" && "قيد الانتظار (Pending)"}
                          {s === "CONFIRMED" && "مؤكد ومقبول (Confirmed)"}
                          {s === "PARTIALLY_PAID" && "مدفوع جزئياً (Partially Paid)"}
                          {s === "PAID" && "مدفوع بالكامل (Paid)"}
                          {s === "COMPLETED" && "مكتمل ومنتهي (Completed)"}
                          {s === "CANCELLED" && "ملغي (Cancelled)"}
                          {s === "REFUNDED" && "مسترجع (Refunded)"}
                          {!["PENDING", "CONFIRMED", "PARTIALLY_PAID", "PAID", "COMPLETED", "CANCELLED", "REFUNDED"].includes(s) && s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isTerminal && (
                    <p className="text-[11px] text-amber-500 font-medium">
                      هذا الحجز في حالة نهائية ({booking.status}) ولا توجد حالات انتقال متاحة له.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">سبب التغيير / ملاحظة الحالة (اختياري)</Label>
                  <Input 
                    placeholder="مثال: طلب العميل الإلغاء / تم التحقق من الدفع..." 
                    value={statusReason} 
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <Button 
                  onClick={handleSaveStatus} 
                  disabled={updateStatus.isPending || isTerminal || status === currentStatus}
                  className="w-full mt-4 font-bold rounded-xl"
                >
                  {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  تحديث حالة الحجز
                </Button>

                <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold">تسجيل دفعة نقدية أو تحويل بنكي</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    تسجيل الدفع المباشر يقوم بتحديث المبالغ المدفوعة تلقائياً ونقل الحجز إلى حالة مؤكد أو مدفوع جزئياً مع تحديث الفاتورة.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentOpen(true)}
                    className="w-full rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> تسجيل دفعة مالية للحجز
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ASSIGNEE TAB */}
            <TabsContent value="assignee" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">معرّف الموظف المسؤول (Assignee ID)</Label>
                  <Input 
                    placeholder="أدخل معرّف المشرف المسؤول (اتركه فارغاً لإلغاء التعيين)" 
                    value={assigneeId} 
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="text-xs rounded-xl font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    تعيين هذا الحجز لأحد أعضاء الفريق لمتابعته وإدارته بشكل مخصص.
                  </p>
                </div>

                <Button 
                  onClick={handleSaveAssignee} 
                  disabled={assignBooking.isPending}
                  className="w-full mt-4 font-bold rounded-xl"
                >
                  {assignBooking.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  حفظ تعيين المسؤول
                </Button>
              </div>
            </TabsContent>

            {/* PASSENGERS TAB */}
            <TabsContent value="passengers" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold">قائمة وبيانات المسافرين</Label>
                  <Button variant="outline" size="sm" onClick={addPassenger} className="font-bold text-xs rounded-xl">
                    <Plus className="mr-1 h-4 w-4" /> إضافة مسافر ➕
                  </Button>
                </div>

                {passengers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-xl text-xs font-bold">
                    لا يوجد مسافرون مضافون. اضغط إضافة مسافر بالأعلى.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {passengers.map((p, index) => (
                      <div key={index} className="border rounded-xl p-4 space-y-4 bg-muted/20">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-xs">المسافر #{index + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0 rounded-xl cursor-pointer" onClick={() => removePassenger(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold">الاسم الكامل</Label>
                            <Input 
                              value={p.fullName} 
                              onChange={(e) => updatePassenger(index, "fullName", e.target.value)}
                              placeholder="الاسم الثلاثي"
                              className="text-xs rounded-xl"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold">الفئة العمرية</Label>
                            <Select onValueChange={(val) => val && updatePassenger(index, "passengerType", val)} defaultValue={p.passengerType}>
                              <SelectTrigger className="w-full h-9 font-bold text-xs rounded-xl">
                                <SelectValue placeholder="الفئة" />
                              </SelectTrigger>
                              <SelectContent className="font-bold text-xs">
                                <SelectItem value="ADULT">بالغ (Adult)</SelectItem>
                                <SelectItem value="CHILD">طفل (Child)</SelectItem>
                                <SelectItem value="INFANT">رضيع (Infant)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold">رقم جواز السفر</Label>
                            <Input 
                              value={p.passportNumber || ""} 
                              onChange={(e) => updatePassenger(index, "passportNumber", e.target.value)}
                              placeholder="A1234567"
                              className="text-xs rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold">تاريخ انتهاء الجواز</Label>
                            <Input 
                              type="date"
                              value={p.passportExpiry ? p.passportExpiry.split("T")[0] : ""} 
                              onChange={(e) => updatePassenger(index, "passportExpiry", e.target.value)}
                              className="text-xs rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold">الجنسية</Label>
                            <Input 
                              value={p.nationality || ""} 
                              onChange={(e) => updatePassenger(index, "nationality", e.target.value)}
                              placeholder="مثال: EG, SA, AE"
                              className="text-xs rounded-xl"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-bold">تاريخ الميلاد</Label>
                            <Input 
                              type="date"
                              value={p.dateOfBirth ? p.dateOfBirth.split("T")[0] : ""} 
                              onChange={(e) => updatePassenger(index, "dateOfBirth", e.target.value)}
                              className="text-xs rounded-xl font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleSavePassengers} 
                  disabled={upsertPassengers.isPending}
                  className="w-full mt-4 font-bold rounded-xl"
                >
                  {upsertPassengers.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  حفظ بيانات المسافرين
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>

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
