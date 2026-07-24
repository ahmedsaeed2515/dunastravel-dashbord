"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NotificationDeliveryLog } from "../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, RotateCcw, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRetryNotification } from "../hooks/useCommunications";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export const columns: ColumnDef<NotificationDeliveryLog>[] = [
  {
    accessorKey: "recipientEmail",
    header: "Recipient",
    cell: ({ row }) => (
      <div className="font-medium dir-ltr text-start">{row.original.recipientEmail}</div>
    ),
  },
  {
    accessorKey: "notificationType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.notificationType.replace(/_/g, " ");
      return <div className="text-sm text-muted-foreground capitalize">{type.toLowerCase()}</div>;
    },
  },
  {
    accessorKey: "originReferenceCode",
    header: "Reference",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs dir-ltr inline-block">
        {row.original.originReferenceCode}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: "attempts",
    header: "Attempts",
    cell: ({ row }) => (
      <div className="text-sm dir-ltr inline-block">
        {row.original.attempts} {row.original.attempts >= 3 && <AlertTriangle className="inline h-3 w-3 text-rose-500 ms-1" />}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      let formatted = "—";
      if (row.original.createdAt) {
        const d = new Date(row.original.createdAt);
        if (!isNaN(d.getTime())) {
          try { formatted = format(d, "MMM d, yyyy HH:mm"); } catch {}
        }
      }
      return <div className="text-muted-foreground text-sm">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original;
      return <ActionCell log={log} />;
    },
  },
];

function ActionCell({ log }: { log: NotificationDeliveryLog }) {
  const retryMutation = useRetryNotification();
  const tCommon = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        
        {(log.status === "FAILED" || log.status === "EXHAUSTED") && (
          <DropdownMenuItem 
            onClick={() => retryMutation.mutate(log.id)}
            className="text-amber-600 focus:text-amber-600 cursor-pointer"
          >
            <RotateCcw className="me-2 h-4 w-4" />
            {tCommon("confirm")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
