"use client";

import { useState, useMemo } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Save, Calendar, Users, DollarSign, Loader2 } from "lucide-react";
import { useCreateManualBooking } from "../../hooks/useBookings";
import { useTours } from "@/features/tours/hooks/useTours";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CreateBookingDrawer() {
  const [open, setOpen] = useState(false);
  const { mutate: createBooking, isPending } = useCreateManualBooking();
  const { data: toursData, isLoading: toursLoading } = useTours({ limit: 100, status: "PUBLISHED" });

  const [tourId, setTourId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [transportChoice, setTransportChoice] = useState("PRIVATE_CAR");
  const [notes, setNotes] = useState("");

  const selectedTour = useMemo(() => {
    return toursData?.data?.find((t) => t.id === tourId || t.slug === tourId);
  }, [toursData, tourId]);

  const estimatedTotal = useMemo(() => {
    if (!selectedTour) return 0;
    const base = Number(selectedTour.basePriceUsd) || 0;
    const adultTotal = base * adults;
    const childTotal = base * 0.5 * children;
    return adultTotal + childTotal;
  }, [selectedTour, adults, children]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourId) {
      toast.error("يرجى اختيار رحلة من القائمة");
      return;
    }

    if (!nationality.trim()) {
      toast.error("يرجى إدخال جنسية العميل لإتمام الحجز");
      return;
    }

    createBooking(
      {
        tourId: selectedTour?.id || tourId,
        fullName,
        email,
        phone,
        nationality: nationality.trim(),
        arrivalDate,
        departureDate: departureDate || undefined,
        adults,
        children,
        infants,
        transportChoice,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTourId("");
          setFullName("");
          setEmail("");
          setPhone("");
          setNationality("");
          setArrivalDate("");
          setDepartureDate("");
          setAdults(1);
          setChildren(0);
          setInfants(0);
          setNotes("");
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="shadow-sm font-bold gap-1.5 rounded-xl">
          <PlusCircle className="h-4 w-4" />
          إنشاء حجز جديد ➕
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-primary">إنشاء حجز يدوي جديد (New Booking)</SheetTitle>
          <SheetDescription className="text-xs">
            يتم حساب الأسعار وتأكيد الحجز وتحديث الطاقة الاستيعابية تلقائياً عبر النظام.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Tour Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="tourSelect" className="text-xs font-bold flex items-center justify-between">
              <span>البرنامج السياحي (Select Tour) *</span>
              {toursLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select value={tourId} onValueChange={setTourId} required>
              <SelectTrigger id="tourSelect" className="rounded-xl text-xs font-medium">
                <SelectValue placeholder="-- اختر البرنامج السياحي --" />
              </SelectTrigger>
              <SelectContent className="text-xs font-medium max-h-72">
                {toursData?.data?.map((tour) => {
                  const titleObj = (tour.titleJsonb as Record<string, string>) || {};
                  const titleEn = titleObj.en || titleObj.ar || tour.slug;
                  return (
                    <SelectItem key={tour.id} value={tour.id}>
                      <span className="font-bold">{titleEn}</span>
                      <span className="text-muted-foreground font-mono text-[11px] ms-2">
                        (${tour.basePriceUsd} USD)
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Banner Preview */}
          {selectedTour && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">سعر الفرد البالغ:</span>
                <span className="font-bold text-sm font-mono text-primary">${selectedTour.basePriceUsd} USD</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">المسافرين:</span>
                <span className="font-bold text-xs">{adults} بالغ {children > 0 ? `+ ${children} طفل` : ''}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">الإجمالي التقديري:</span>
                <span className="font-bold text-sm font-mono text-emerald-600 dark:text-emerald-400">
                  ${estimatedTotal.toFixed(2)} USD
                </span>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-bold">اسم العميل بالكامل *</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد محمد علي"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold">البريد الإلكتروني للعميل *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold">رقم الهاتف / واتساب *</Label>
              <Input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transportChoice" className="text-xs font-bold">خيار وسيلة النقل</Label>
              <Select value={transportChoice} onValueChange={setTransportChoice}>
                <SelectTrigger id="transportChoice" className="rounded-xl text-xs">
                  <SelectValue placeholder="اختر وسيلة النقل" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="PRIVATE_CAR">سيارة خاصة مكيفة (Private VIP Car)</SelectItem>
                  <SelectItem value="COASTER">حافلة كوستر سياحية (Coaster Bus)</SelectItem>
                  <SelectItem value="LARGE_BUS">حافلة سياحية كبرى (50 Pax Grand Coach)</SelectItem>
                  <SelectItem value="NONE">بدون انتقالات إضافية (Self Transfer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nationality" className="text-xs font-bold">جنسية العميل *</Label>
            <Input
              id="nationality"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="مثال: مصري، سعودي، أمريكي..."
              className="rounded-xl text-xs"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="arrivalDate" className="text-xs font-bold">تاريخ الوصول والسفر *</Label>
              <Input
                id="arrivalDate"
                type="date"
                required
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="departureDate" className="text-xs font-bold">تاريخ المغادرة (اختياري)</Label>
              <Input
                id="departureDate"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="adults" className="text-xs font-bold">البالغين (Adults) *</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                required
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                className="rounded-xl font-bold text-center text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="children" className="text-xs font-bold">الأطفال (2-11 سنة)</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                className="rounded-xl font-bold text-center text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="infants" className="text-xs font-bold">الرضع (&lt; 2 سنة)</Label>
              <Input
                id="infants"
                type="number"
                min="0"
                value={infants}
                onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                className="rounded-xl font-bold text-center text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold">ملاحظات وطلبات خاصة (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="مثال: متطلبات غذائية خاصة، ذكرى زواج، تفاصيل الطيران..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <Button type="submit" className="w-full mt-6 rounded-xl font-bold gap-2 h-10" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري إنشاء الحجز وحساب الأسعار...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> تأكيد وحفظ الحجز في النظام
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
