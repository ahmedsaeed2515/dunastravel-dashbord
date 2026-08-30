"use client";

import React, { memo } from "react";
import { Tour } from "../../types";
import { TransferTripModal } from "@/components/trips/TransferTripModal";

interface MoveTourDialogProps {
  tour: Tour | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MoveTourDialog: React.FC<MoveTourDialogProps> = memo(({
  tour,
  open,
  onOpenChange,
}) => {
  return (
    <TransferTripModal
      tour={tour}
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => onOpenChange(false)}
    />
  );
});

MoveTourDialog.displayName = "MoveTourDialog";
