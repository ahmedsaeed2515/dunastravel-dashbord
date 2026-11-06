"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TransportPricingManager } from "@/features/transportation/components/TransportPricingManager";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function TransportPricingDashboard() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");
  const bookingId = searchParams.get("bookingId");

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin margin-right-2" />
      <span>Loading transport pricing...</span>
    </div>}>
      <div className="min-h-screen bg-background p-4">
        <TransportPricingManager
          tourId={tourId ? tourId === 'true' ? undefined : tourId : undefined}
          bookingId={bookingId ? bookingId === 'true' ? undefined : bookingId : undefined}
          initialCategory="transportation"
        />
      </div>
    </Suspense>
  );
}