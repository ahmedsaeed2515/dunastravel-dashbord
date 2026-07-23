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
  const [userId, setUserId] = useState("");
  const [passengers, setPassengers] = useState<number>(1);
  const [manualAmountUsd, setManualAmountUsd] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking(
      {
        tourId,
        userId,
        passengers: Array(Number(passengers)).fill({ passengerType: "ADULT", fullName: "TBD" }),
        manualAmountUsd: manualAmountUsd ? Number(manualAmountUsd) : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTourId("");
          setUserId("");
          setPassengers(1);
          setManualAmountUsd("");
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
            Override standard flows to manually create a booking for a user.
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
            <Label htmlFor="userId">User ID or Email</Label>
            <Input
              id="userId"
              placeholder="user@example.com or uuid"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengers">Number of Passengers</Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              required
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manualAmountUsd">Manual Override Amount (USD)</Label>
            <Input
              id="manualAmountUsd"
              type="number"
              step="0.01"
              placeholder="Leave blank for automatic pricing"
              value={manualAmountUsd}
              onChange={(e) => setManualAmountUsd(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              If set, this will ignore standard pricing logic.
            </p>
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
