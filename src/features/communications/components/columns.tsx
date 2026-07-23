"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NotificationDeliveryLog } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const columns: ColumnDef<NotificationDeliveryLog>[] = [
  {
    accessorKey: "recipientEmail",
    header: "Recipient",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.recipientEmail}</div>
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
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.originReferenceCode}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",
        SENT: "default",
        FAILED: "destructive",
        EXHAUSTED: "destructive",
      };
      
      return (
        <Badge variant={variants[status] || "outline"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "attempts",
    header: "Attempts",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.attempts} {row.original.attempts >= 3 && <AlertTriangle className="inline h-3 w-3 text-rose-500 ml-1" />}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      let formatted = "-";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* Only allow retry if it's not SENT or PENDING */}
        {(log.status === "FAILED" || log.status === "EXHAUSTED") && (
          <DropdownMenuItem 
            onClick={() => retryMutation.mutate(log.id)}
            className="text-amber-600 focus:text-amber-600 cursor-pointer"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Delivery
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Email Details</DropdownMenuItem>
        <DropdownMenuItem>View Related Entity</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
