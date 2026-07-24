"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Commission } from "../types";
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
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { useTranslations } from "next-intl";

export const columns: ColumnDef<Commission>[] = [
  {
    accessorKey: "booking.referenceCode",
    header: "Ref Code",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium dir-ltr inline-block">{row.original.booking?.referenceCode || "—"}</span>
        {row.original.booking?.invoiceNumber && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 dir-ltr inline-flex">
            <FileText className="h-3 w-3" /> {row.original.booking.invoiceNumber}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "company.name",
    header: "Partner",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.original.company?.name || "—"}</span>
        <span className="text-xs text-muted-foreground dir-ltr inline-block">{row.original.company?.referenceCode || ""}</span>
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => <div className="dir-ltr inline-block">{row.original.rate}%</div>,
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
      return <div className="font-semibold text-emerald-600 dark:text-emerald-400 dir-ltr inline-block">{formatted}</div>;
    },
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
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      let formatted = "-";
      if (row.original.createdAt) {
        const d = new Date(row.original.createdAt);
        if (!isNaN(d.getTime())) {
          try { formatted = format(d, "MMM d, yyyy"); } catch {}
        }
      }
      return <div className="text-muted-foreground">{formatted}</div>;
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
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("accessibility");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger type="button" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
        <span className="sr-only">{tAccess("openMenu")}</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
        
        {commission.status === "PENDING" && (
          <>
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: commission.id, status: 'APPROVED' })}
              className="text-emerald-600 focus:text-emerald-600"
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="me-2 h-4 w-4" />
              {tCommon("confirm")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: commission.id, status: 'CANCELLED' })}
              className="text-destructive focus:text-destructive"
              disabled={updateStatus.isPending}
            >
              <XCircle className="me-2 h-4 w-4" />
              {tCommon("cancel")}
            </DropdownMenuItem>
          </>
        )}
        
        {commission.status === "APPROVED" && (
          <DropdownMenuItem 
            onClick={() => updateStatus.mutate({ id: commission.id, status: 'PAID' })}
            className="text-blue-600 focus:text-blue-600"
            disabled={updateStatus.isPending}
          >
            <HandCoins className="me-2 h-4 w-4" />
            {tCommon("confirm")}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => {
            if (!commission.booking?.invoiceNumber) {
              toast.error(tCommon("error"));
            } else {
              toast.info(tCommon("info"));
            }
          }}
        >
          <Download className="me-2 h-4 w-4" /> {tCommon("download")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
