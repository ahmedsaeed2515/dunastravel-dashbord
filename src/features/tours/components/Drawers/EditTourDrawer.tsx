"use client";

import { useMemo } from "react";
import { Tour } from "../../types";
import { TripEditorModal } from "@/components/trips/TripEditorModal";
import { tourToTripModel } from "../../lib/tripEditorPayload";

interface EditTourDrawerProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTourDrawer({ tour, open, onOpenChange }: EditTourDrawerProps) {
  const tripModel = useMemo(() => {
    if (!tour) return null;
    return tourToTripModel(tour);
  }, [tour]);

  if (!open || !tour) return null;

  return (
    <TripEditorModal
      trip={tripModel}
      isOpen={open}
      onClose={() => onOpenChange(false)}
    />
  );
}

