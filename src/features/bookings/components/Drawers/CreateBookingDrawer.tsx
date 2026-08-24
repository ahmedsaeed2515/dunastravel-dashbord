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
        <Button className="shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Booking
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-playfair text-primary">New Booking (Manual)</SheetTitle>
          <SheetDescription>
            Pricing and capacity are calculated and reserved by the server.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="tourId">Tour ID</Label>
            <Input
              id="tourId"
              placeholder="e.g. tour_uuid"
              required
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Customer name</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Customer email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Customer phone</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrivalDate">Arrival date</Label>
            <Input id="arrivalDate" type="date" required value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <Input id="adults" type="number" min="1" required value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
          </div>

          <Button type="submit" className="w-full mt-8" disabled={isPending}>
            {isPending ? "Creating..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Booking
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
