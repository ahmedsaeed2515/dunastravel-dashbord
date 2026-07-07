"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Commission } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, CheckCircle, XCircle, HandCoins, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateCommissionStatus } from "../hooks/useFinance";

export const columns: ColumnDef<Commission>[] = [
  {
    accessorKey: "booking.referenceCode",
    header: "Booking Ref",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.booking?.referenceCode || "Unknown"}</span>
        {row.original.booking?.invoiceNumber && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <FileText className="h-3 w-3" /> {row.original.booking.invoiceNumber}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "company.name",
    header: "B2B Partner",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.original.company?.name || "Unknown"}</span>
        <span className="text-xs text-muted-foreground">{row.original.company?.referenceCode || ""}</span>
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => <div>{row.original.rate}%</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.original.amount);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return <div className="font-semibold text-emerald-600 dark:text-emerald-400">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",
        APPROVED: "default",
        PAID: "outline",
        CANCELLED: "destructive",
      };
      
      return (
        <Badge variant={variants[status] || "outline"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{format(new Date(row.original.createdAt), "MMM d, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const commission = row.original;
      return <ActionCell commission={commission} />;
    },
  },
];

function ActionCell({ commission }: { commission: Commission }) {
  const updateStatus = useUpdateCommissionStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {commission.status === "PENDING" && (
          <>
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: commission.id, status: 'APPROVED' })}
              className="text-emerald-600 focus:text-emerald-600"
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Credit Wallet
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: commission.id, status: 'CANCELLED' })}
              className="text-destructive focus:text-destructive"
              disabled={updateStatus.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Commission
            </DropdownMenuItem>
          </>
        )}
        
        {commission.status === "APPROVED" && (
          <DropdownMenuItem 
            onClick={() => updateStatus.mutate({ id: commission.id, status: 'PAID' })}
            className="text-blue-600 focus:text-blue-600"
            disabled={updateStatus.isPending}
          >
            <HandCoins className="mr-2 h-4 w-4" />
            Mark as Paid (Bank Wire)
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => {
            if (!commission.booking?.invoiceNumber) {
              toast.error("No invoice available for this booking.");
            } else {
              toast.info("Invoice download is not yet supported by the backend.");
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" /> Download Invoice PDF
        </DropdownMenuItem>
        <DropdownMenuItem>View Booking</DropdownMenuItem>
        <DropdownMenuItem>View Company</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
