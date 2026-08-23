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

  if (["CONFIRMED", "COMPLETED", "PUBLISHED", "PAID", "ACTIVE", "APPROVED", "RESOLVED", "CONVERTED", "HEALTHY"].includes(upper)) {
    variant = "success";
  } else if (["PENDING", "DRAFT", "NEW", "NEWLY_RECEIVED", "OPEN", "IN_PROGRESS", "IN_REVIEW", "PROCESSING", "QUOTED", "HANDED_OFF"].includes(upper)) {
    variant = "warning";
  } else if (["CANCELLED", "FAILED", "SUSPENDED", "REJECTED", "EXPIRED", "UNQUALIFIED", "OVERDUE", "RATE_LIMITED"].includes(upper)) {
    variant = "destructive";
  } else if (["REFUNDED", "CLOSED", "ARCHIVED"].includes(upper)) {
    variant = "secondary";
  } else if (["VIP", "QUALIFIED"].includes(upper)) {
    variant = "default";
  }

  return (
    <Badge variant={variant} className={className}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current me-1.5 opacity-80 shrink-0" />
      {getStatusLabel(status)}
    </Badge>
  );
}
