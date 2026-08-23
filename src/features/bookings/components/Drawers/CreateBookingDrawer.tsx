"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Save } from "lucide-react";
import { useCreateManualBooking } from "../../hooks/useBookings";
import { Label } from "@/components/ui/label";
import { useTourAvailability, useTours } from "@/features/tours/hooks/useTours";

export function CreateBookingDrawer() {
  const [open, setOpen] = useState(false);
  const { mutate: createBooking, isPending } = useCreateManualBooking();
  const { data: toursPage, isLoading: toursLoading } = useTours({ page: 1, limit: 100, status: "PUBLISHED" });
  const tours = toursPage?.data ?? [];
  const [tourId, setTourId] = useState("");
  const selectedTour = tours.find((tour) => tour.id === tourId);
  const { data: availabilities = [], isLoading: availabilityLoading } = useTourAvailability(selectedTour?.slug ?? "");
  const [availabilityId, setAvailabilityId] = useState("");
  const selectedAvailability = availabilities.find((slot) => slot.id === availabilityId);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const passengers = useMemo(() => {
    const rows: Array<{ passengerType: "ADULT" | "CHILD" | "INFANT"; fullName: string }> = [];
    for (let index = 0; index < adults; index += 1) rows.push({ passengerType: "ADULT", fullName: index === 0 ? fullName : `Adult ${index + 1} - TBD` });
    for (let index = 0; index < children; index += 1) rows.push({ passengerType: "CHILD", fullName: `Child ${index + 1} - TBD` });
    for (let index = 0; index < infants; index += 1) rows.push({ passengerType: "INFANT", fullName: `Infant ${index + 1} - TBD` });
    return rows;
  }, [adults, children, infants, fullName]);

  const reset = () => {
    setTourId(""); setAvailabilityId(""); setUserId(""); setFullName(""); setEmail(""); setPhone("");
    setAdults(1); setChildren(0); setInfants(0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAvailability) return;
    createBooking({
      tourId,
      availabilityId: selectedAvailability.id,
      arrivalDate: selectedAvailability.date.slice(0, 10),
      fullName,
      email,
      phone,
      ...(userId.trim() ? { userId: userId.trim() } : {}),
      adults,
      children,
      infants,
      passengers,
    }, { onSuccess: () => { setOpen(false); reset(); } });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button className="shadow-sm"><PlusCircle className="me-2 h-4 w-4" />إنشاء حجز</Button></SheetTrigger>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]" dir="rtl">
        <SheetHeader className="mb-6 text-start">
          <SheetTitle className="text-2xl font-playfair text-primary">حجز يدوي جديد</SheetTitle>
          <SheetDescription>اختر الرحلة والموعد المتاح ثم أدخل بيانات العميل المطابقة لعقد الحجز.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tourId">الرحلة</Label>
            <select id="tourId" required value={tourId} disabled={toursLoading} onChange={(event) => { setTourId(event.target.value); setAvailabilityId(""); }} className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm">
              <option value="">اختر رحلة منشورة...</option>
              {tours.map((tour) => <option key={tour.id} value={tour.id}>{String(tour.titleJsonb.ar || tour.titleJsonb.en || tour.slug)}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availabilityId">موعد المغادرة</Label>
            <select id="availabilityId" required value={availabilityId} disabled={!selectedTour || availabilityLoading} onChange={(event) => setAvailabilityId(event.target.value)} className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm">
              <option value="">اختر موعدًا متاحًا...</option>
              {availabilities.map((slot) => <option key={slot.id} value={slot.id}>{slot.date.slice(0, 10)} — {slot.remainingSeats} مقعد متاح</option>)}
            </select>
            {selectedTour && !availabilityLoading && availabilities.length === 0 && <p className="text-xs text-destructive">لا توجد مواعيد قابلة للحجز لهذه الرحلة.</p>}
          </div>
          <div className="space-y-2"><Label htmlFor="fullName">اسم العميل</Label><Input id="fullName" required value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="phone">رقم الهاتف</Label><Input id="phone" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="userId">معرّف العميل UUID (اختياري)</Label><Input id="userId" placeholder="اتركه فارغًا لحجز ضيف" value={userId} onChange={(event) => setUserId(event.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label htmlFor="adults">بالغون</Label><Input id="adults" type="number" min="1" max="100" required value={adults} onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))} /></div>
            <div className="space-y-2"><Label htmlFor="children">أطفال</Label><Input id="children" type="number" min="0" max="100" value={children} onChange={(event) => setChildren(Math.max(0, Number(event.target.value) || 0))} /></div>
            <div className="space-y-2"><Label htmlFor="infants">رضع</Label><Input id="infants" type="number" min="0" max="100" value={infants} onChange={(event) => setInfants(Math.max(0, Number(event.target.value) || 0))} /></div>
          </div>
          <Button type="submit" className="mt-8 w-full" disabled={isPending || !selectedAvailability}>
            {isPending ? "جارٍ إنشاء الحجز..." : <><Save className="me-2 h-4 w-4" />حفظ الحجز</>}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
