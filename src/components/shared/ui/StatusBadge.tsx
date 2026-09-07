"use client";

import { Badge } from "@/components/ui/badge";
import { useLocalizedStatus } from "@/lib/status-localization";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusLabel = useLocalizedStatus();
  if (!status) return null;

  const upper = status.toUpperCase().trim();
  let variant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" = "secondary";

  if (["CONFIRMED", "COMPLETED", "PUBLISHED", "PAID", "ACTIVE", "APPROVED", "RESOLVED", "SENT", "DELIVERED", "CONVERTED_TO_BOOKING"].includes(upper)) {
    variant = "success";
  } else if (["PENDING", "DRAFT", "NEW", "OPEN", "IN_PROGRESS", "NEWLY_RECEIVED", "QUOTED", "READ"].includes(upper)) {
    variant = "warning";
  } else if (["CANCELLED", "FAILED", "SUSPENDED", "REJECTED", "EXPIRED", "EXHAUSTED", "CLOSED"].includes(upper)) {
    variant = "destructive";
  } else if (["VIP"].includes(upper)) {
    variant = "default";
  }

  return (
    <Badge variant={variant} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}
