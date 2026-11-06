import React from "react";
import { TransportPricingManager } from "@/features/transportation/components/TransportPricingManager";
import { useSearchParams } from "next/navigation";

export default function TransportPricingPage() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen bg-background p-4">
      <TransportPricingManager
        tourId={tourId || undefined}
        bookingId={bookingId || undefined}
        initialCategory="transportation"
      />
    </div>
  );
}