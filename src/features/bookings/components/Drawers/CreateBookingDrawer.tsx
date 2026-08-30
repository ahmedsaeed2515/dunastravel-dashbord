"use client";

import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Save } from "lucide-react";
import { useCreateManualBooking } from "../../hooks/useBookings";
import { Label } from "@/components/ui/label";

export function CreateBookingDrawer() {
  const [open, setOpen] = useState(false);
  const { mutate: createBooking, isPending } = useCreateManualBooking();

  const [tourId, setTourId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [adults, setAdults] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking(
      {
        tourId,
        fullName,
        email,
        phone,
        arrivalDate,
        adults,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTourId("");
          setFullName("");
          setEmail("");
          setPhone("");
          setArrivalDate("");
          setAdults(1);
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
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-primary">إنشاء حجز يدوي جديد (New Booking)</SheetTitle>
          <SheetDescription className="text-xs">
            يتم حساب الأسعار وتأكيد الحجز وتحديث الطاقة الاستيعابية تلقائياً عبر النظام.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="tourId" className="text-xs font-bold">معرف / كود الرحلة (Tour ID / Slug)</Label>
            <Input
              id="tourId"
              placeholder="مثال: egypt-classic-tour"
              required
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              className="rounded-xl font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-bold">اسم العميل بالكامل</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد محمد علي"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold">البريد الإلكتروني للعميل</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-bold">رقم الهاتف / واتساب</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 100 000 0000"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="arrivalDate" className="text-xs font-bold">تاريخ الوصول والسفر</Label>
            <Input id="arrivalDate" type="date" required value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adults" className="text-xs font-bold">عدد المسافرين البالغين (Adults)</Label>
            <Input id="adults" type="number" min="1" required value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="rounded-xl font-bold" />
          </div>

          <Button type="submit" className="w-full mt-6 rounded-xl font-bold gap-2" disabled={isPending}>
            {isPending ? "جاري إنشاء الحجز..." : (
              <>
                <Save className="h-4 w-4" /> تأكيد وحفظ الحجز
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
