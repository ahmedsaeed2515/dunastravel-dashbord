"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Star, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { CustomerRowActions } from "./CustomerRowActions";

export function getColumns(
  onView: (customer: Customer) => void,
  onToggleVip: (customer: Customer) => void,
  onToggleStatus: (customer: Customer) => void,
  tCustomers: (key: string) => string,
  tCommon: (key: string) => string
): ColumnDef<Customer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "customerNumber",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-semibold text-primary flex items-center gap-1.5 cursor-pointer dir-ltr inline-flex" onClick={() => onView(row.original)}>
          {row.getValue("customerNumber")}
          {row.original.isVip && (
            <span title="VIP Customer"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /></span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: tCustomers("customerName"),
      cell: ({ row }) => (
        <div className="cursor-pointer" onClick={() => onView(row.original)}>
          <div className="font-medium text-gray-900 dark:text-gray-100">{row.getValue("name")}</div>
          <div className="text-xs text-gray-500 dir-ltr text-start">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      id: "segmentation",
      header: tCommon("category"),
      cell: ({ row }) => {
        const segments = row.original.segments || [];
        const tags = row.original.tags || [];
        const combined = [...segments, ...tags];
        if (combined.length === 0) return <span className="text-xs text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {combined.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-gray-50 dark:bg-gray-800">
                {tag}
              </Badge>
            ))}
            {combined.length > 2 && (
              <Badge variant="outline" className="text-[10px] text-gray-400">
                +{combined.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalSpent",
      header: tCustomers("totalSpent"),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalSpent"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium text-gray-900 dark:text-gray-100 dir-ltr inline-block">{formatted}</div>;
      },
    },
    {
      accessorKey: "outstandingBalance",
      header: tCommon("total"),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("outstandingBalance"));
        if (amount <= 0) return <span className="text-xs text-gray-400 dir-ltr inline-block">$0.00</span>;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return (
          <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 dir-ltr inline-flex">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        let formatted = "-";
        if (val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            try { formatted = format(d, "MMM do, yyyy"); } catch {}
          }
        }
        return <span className="text-xs text-gray-600 dark:text-gray-300">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <CustomerRowActions
            customer={row.original}
            onView={onView}
            onToggleVip={onToggleVip}
            onToggleStatus={onToggleStatus}
          />
        );
      },
    },
  ];
}
